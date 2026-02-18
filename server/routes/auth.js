import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Create new user account
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name, role, phone, location_lat, location_lng, location_address, organization_name } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, and role are required'
      });
    }

    // Validate role
    const validRoles = ['provider', 'volunteer', 'recipient'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      console.error('Signup error:', authError);
      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        phone,
        location_lat: location_lat ? parseFloat(location_lat) : null,
        location_lng: location_lng ? parseFloat(location_lng) : null,
        location_address,
        organization_name
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user profile'
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully. Please check your email for verification.',
      data: {
        user: authData.user,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * User login (handled by Supabase client-side, this is for reference)
 */
router.post('/login', async (req, res) => {
  res.json({
    success: false,
    message: 'Please use Supabase client-side authentication'
  });
});

export default router;
