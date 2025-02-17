const rolesPerm = (...rolesPerm) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }

        const user = req.session.user;

        if (rolesPerm.length > 0 && !rolesPerm.includes(user.rol)) {
            return res.status(403).render('error', {
                title: "Error",
                error: "Error: No tienes los permisos necesarios.",
                code: 403
            });
        }

        req.user = user;

        next();
    };
};

module.exports = { rolesPerm };
