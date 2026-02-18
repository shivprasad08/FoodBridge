import { supabase, supabaseAdmin } from '../config/supabase.js';

/**
 * Authentication Middleware
 * Verifies JWT token from Supabase and attaches user to request
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Fetch user profile with role using admin client (bypasses RLS)
    const dbClient = supabaseAdmin || supabase;
    const { data: profile, error: profileError } = await dbClient
      .from('users')
      .select('id, role, name, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({
        success: false,
        error: 'User profile not found'
      });
    }

    // Attach user data to request
    req.user = {
      id: profile.id,
      role: profile.role,
      name: profile.name,
      email: profile.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Role-based Authorization Middleware
 * @param {Array<string>} allowedRoles - Array of allowed user roles
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
