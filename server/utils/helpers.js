/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Create audit log entry
 * @param {string} action - Action name
 * @param {Object} details - Additional details
 */
export async function createAuditLog(supabase, userId, action, entityType, entityId, details = {}) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Validate time window (must be in future)
 */
export function validateTimeWindow(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format');
  }

  if (end <= start) {
    throw new Error('Pickup end time must be after start time');
  }

  return true;
}
