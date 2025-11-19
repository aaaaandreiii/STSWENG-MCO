const logActivity = require('../helpers/activityLogger');

const VALID_ROLES = ['admin', 'manager', 'frontdesk'];

function requireRoles(allowedRoles = []) {
  return async function (req, res, next) {
    try {
      const user = req.session && req.session.user;
      if (!user || !user.role || !VALID_ROLES.includes(user.role)) {
        await logActivity(user?.username || 'unknown', 'Access denied: invalid or missing role');
        return res.status(403).render('error', { message: 'Access denied' });
      }

      if (!allowedRoles.includes(user.role)) {
        await logActivity(user.username, 'Access denied: insufficient role');
        return res.status(403).render('error', { message: 'Access denied' });
      }

      next();
    } catch (err) {
      console.error('RBAC middleware error:', err);
      return res.status(500).render('error', { message: 'Something went wrong' });
    }
  };
}

module.exports = { requireRoles };
