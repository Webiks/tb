const checkAuth = (req, res, next) => {
	if (req.session.authenticated) {
		next();
	} else {
		res.status(401).send('unAuthorized');
	}
};

module.exports = checkAuth;
