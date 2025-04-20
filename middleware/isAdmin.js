const isAdmin = (req, res, next) => {
    console.log(req.user);
    
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
  };
  

  module.exports = isAdmin;