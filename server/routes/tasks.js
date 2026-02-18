import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';
import { validateFields } from '../middleware/errorHandler.js';
import { calculateDistance, createAuditLog } from '../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/tasks/nearby
 * Volunteers see nearby available tasks
 */
router.get('/nearby', authenticateUser, authorizeRoles('volunteer'), async (req, res, next) => {
  try {
    const { radius = 10 } = req.query; // Default 10 km radius

    // Get volunteer's location
    const { data: volunteer } = await supabase
      .from('users')
      .select('location_lat, location_lng')
      .eq('id', req.user.id)
      .single();

    if (!volunteer?.location_lat || !volunteer?.location_lng) {
      return res.status(400).json({
        success: false,
        error: 'Please update your location in profile settings'
      });
    }

    // Get all available listings
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
      .gte('pickup_time_end', new Date().toISOString());

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch listings'
      });
    }

    // Filter by distance
    const nearbyListings = listings
      .map(listing => {
        const distance = calculateDistance(
          volunteer.location_lat,
          volunteer.location_lng,
          listing.pickup_lat,
          listing.pickup_lng
        );
        return { ...listing, distance };
      })
      .filter(listing => listing.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: nearbyListings,
      count: nearbyListings.length,
      radius: `${radius} km`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tasks/accept
 * Volunteer accepts a task
 */
router.post('/accept', authenticateUser, authorizeRoles('volunteer'), async (req, res, next) => {
  try {
    const { listing_id, recipient_id } = req.body;

    validateFields(req.body, ['listing_id']);

    // Check if listing is still available
    const { data: listing } = await supabase
      .from('food_listings')
      .select('status')
      .eq('id', listing_id)
      .single();

    if (!listing || listing.status !== 'Available') {
      return res.status(400).json({
        success: false,
        error: 'This listing is no longer available'
      });
    }

    // Create task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        listing_id,
        volunteer_id: req.user.id,
        recipient_id: recipient_id || null,
        status: 'Assigned'
      })
      .select()
      .single();

    if (taskError) {
      console.error('Task creation error:', taskError);
      return res.status(500).json({
        success: false,
        error: 'Failed to accept task'
      });
    }

    // Update listing status
    await supabase
      .from('food_listings')
      .update({ status: 'Reserved' })
      .eq('id', listing_id);

    await createAuditLog(
      supabase,
      req.user.id,
      'TASK_ACCEPTED',
      'task',
      task.id,
      { listing_id }
    );

    res.status(201).json({
      success: true,
      message: 'Task accepted successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks/my-tasks
 * Volunteer views their assigned tasks
 */
router.get('/my-tasks', authenticateUser, authorizeRoles('volunteer'), async (req, res, next) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        food_listings (
          *,
          users!provider_id (
            name,
            organization_name,
            phone
          )
        ),
        users!recipient_id (
          name,
          organization_name,
          location_address
        )
      `)
      .eq('volunteer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch tasks'
      });
    }

    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/tasks/:id/status
 * Update task status (PickedUp, Delivered, etc.)
 */
router.patch('/:id/status', authenticateUser, authorizeRoles('volunteer', 'recipient'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Assigned', 'PickedUp', 'Delivered', 'Confirmed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Verify authorization
    const { data: task } = await supabase
      .from('tasks')
      .select('volunteer_id, recipient_id')
      .eq('id', id)
      .single();

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const isVolunteer = task.volunteer_id === req.user.id;
    const isRecipient = task.recipient_id === req.user.id;

    if (!isVolunteer && !isRecipient) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }

    // Update task with timestamp
    const updateData = { status };
    if (status === 'PickedUp') updateData.picked_up_at = new Date().toISOString();
    if (status === 'Delivered') updateData.delivered_at = new Date().toISOString();
    if (status === 'Confirmed') updateData.confirmed_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update task status'
      });
    }

    // Update corresponding listing status
    if (status === 'PickedUp') {
      await supabase
        .from('food_listings')
        .update({ status: 'Collected' })
        .eq('id', task.listing_id);
    } else if (status === 'Delivered' || status === 'Confirmed') {
      await supabase
        .from('food_listings')
        .update({ status: 'Delivered' })
        .eq('id', task.listing_id);
    }

    await createAuditLog(
      supabase,
      req.user.id,
      'TASK_STATUS_UPDATED',
      'task',
      id,
      { new_status: status }
    );

    res.json({
      success: true,
      message: 'Task status updated',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

export default router;
