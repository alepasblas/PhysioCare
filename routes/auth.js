const express = require("express");
const User = require("../models/user");

const router = express.Router();


router.get("/", (req, res) => {
    res.render('auth/login', { 
        title: "Login" 
    });
}); 


router.post("/", async (req, res) => {
    try {
        const { login, password } = req.body;

        const existeUsuario = await User.findOne({ 
            login: login, 
            password: password 
        });

        if (existeUsuario) {
            req.session.user = {
                id: existeUsuario._id,
                login: existeUsuario.login,
                rol: existeUsuario.rol,
            };

            return res.redirect("/patients");
        }

        res.render("error", { 
            error: "Usuario o contraseña incorrectos" 
        });

    } catch (error) {
        console.error("Error durante el inicio de sesión:", error);
        res.status(500).render("error", { 
            title: "Error", 
            error: "Error interno del servidor" 
        });
    }

    // if (existeUsuario) {

    //     if (user.password !== password) {
    //         return res.render('/', {
    //             title: "Login - Error",
    //         });
    //     }
    //     req.session.usuario = { login: existeUsuario.login, rol: existeUsuario.rol, id: existeUsuario._id };
    //     res.render('index');
    //     console.log("Usuario logueado con rol: " + req.session.rol);

    // } else {
    //     res.render('auth/login', { 
    //         error: "Usuario o contraseña incorrectos" 
    //     });
    // }
});


router.get("/logout", async (req, res) => {
    req.session.destroy();
    return res.redirect('/login');
});

module.exports = router;
