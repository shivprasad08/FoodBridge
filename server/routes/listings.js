import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';
import { validateFields } from '../middleware/errorHandler.js';
import { createAuditLog, validateTimeWindow } from '../utils/helpers.js';

const router = express.Router();

/**
 * POST /api/listings/create
 * Provider creates a new food listing
 */
router.post('/create', authenticateUser, authorizeRoles('provider'), async (req, res, next) => {
  try {
    const {
      title,
      description,
      quantity_kg,
      food_type,
      pickup_address,
      pickup_lat,
      pickup_lng,
      pickup_time_start,
      pickup_time_end,
      special_instructions
    } = req.body;

    // Validate required fields
    validateFields(req.body, [
      'title',
      'quantity_kg',
      'pickup_address',
      'pickup_lat',
      'pickup_lng',
      'pickup_time_start',
      'pickup_time_end'
    ]);

    // Validate time window
    validateTimeWindow(pickup_time_start, pickup_time_end);

    // Validate quantity
    if (quantity_kg <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0'
      });
    }

    // Insert listing using admin client to bypass RLS
    const dbClient = supabaseAdmin || supabase;
    const { data: listing, error } = await dbClient
      .from('food_listings')
      .insert({
        provider_id: req.user.id,
        title,
        description,
        quantity_kg: parseFloat(quantity_kg),
        food_type,
        pickup_address,
        pickup_lat: parseFloat(pickup_lat),
        pickup_lng: parseFloat(pickup_lng),
        pickup_time_start,
        pickup_time_end,
        special_instructions,
        status: 'Available'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create listing'
      });
    }

    // Create audit log
    await createAuditLog(
      supabase,
      req.user.id,
      'LISTING_CREATED',
      'food_listing',
      listing.id,
      { title, quantity_kg }
    );

    res.status(201).json({
      success: true,
      message: 'Food listing created successfully',
      data: listing
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/listings/my-listings
 * Provider views their own listings
 */
router.get('/my-listings', authenticateUser, authorizeRoles('provider'), async (req, res, next) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    const { data: listings, error } = await dbClient
      .from('food_listings')
      .select('*')
      .eq('provider_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch listings'
      });
    }

    res.json({
      success: true,
      data: listings,
      count: listings.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/listings/available
 * Get all available listings (for volunteers)
 */
router.get('/available', authenticateUser, async (req, res, next) => {
  try {
    const { data: listings, error } = await supabase
      .from('food_listings')
      .select(`
        *,
        users!provider_id (
          name,
          organization_name,
          phone
        )
      `)
      .eq('status', 'Available')
      .gte('pickup_time_end', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch available listings'
      });
    }

    res.json({
      success: true,
      data: listings,
      count: listings.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/listings/:id/status
 * Update listing status
 */
router.patch('/:id/status', authenticateUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Available', 'Reserved', 'Collected', 'Delivered', 'Expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Verify ownership (only provider can update)
    const { data: listing } = await supabase
      .from('food_listings')
      .select('provider_id')
      .eq('id', id)
      .single();

    if (!listing || listing.provider_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this listing'
      });
    }

    const { data: updated, error } = await supabase
      .from('food_listings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update listing status'
      });
    }

    await createAuditLog(
      supabase,
      req.user.id,
      'LISTING_STATUS_UPDATED',
      'food_listing',
      id,
      { new_status: status }
    );

    res.json({
      success: true,
      message: 'Listing status updated',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

export default router;
