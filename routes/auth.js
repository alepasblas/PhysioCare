const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require(__dirname + "/../auth/auth.js");
const bcrypt = require("bcrypt");


router.post("/login", async (req, res) => {
    const { login, password } = req.body;
  
    try {
      const usuario = await User.findOne({ login });
  
      if (!usuario) {
        return res.status(401).send({ error: "login incorrecto" });
      }
  
      const passwordMatch = await bcrypt.compare(password, usuario.password);
      if (!passwordMatch) {
        return res.status(401).send({ error: "login incorrecto" });
      }
  
      const token = auth.generarToken({
        _id: usuario._id,
        login: usuario.login,
        rol: usuario.rol,
      });
  
      res.status(200).send({ status: 200, result: token });
    } catch (error) {
      console.error("Error en el login:", error);
      res.status(500).send({ error: "Error interno del servidor" });
    }
  });
  

router.post("/register", async (req, res) => {
  let login = req.body.login;
  let password = req.body.password;
  let rol = req.body.rol;

  const saltRounds = 10; // Nivel de complejidad del hashing
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    login: login,
    password: hashedPassword,
    rol: rol
  });

  await newUser.save();

  res.send({
    status: 200,
    result: "Usuario registrado exitosamente",
  });
});

module.exports = router;
