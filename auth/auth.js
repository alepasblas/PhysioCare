const dotenv = require("dotenv");

dotenv.config();

const jwt = require('jsonwebtoken');

const secreto = process.env.PALABRASECRETA;


const generarToken = (user) => {
    const payload = {
        id: user._id,
        login: user.login,
        rol: user.rol,
    };

    const token = jwt.sign(payload, secreto, {
        expiresIn: "2 hours",
    });

    return token;
};

let validarToken = (token) => {
    try {
        let resultado = jwt.verify(token, secreto);

        return {
            valid: true,
            resultado,
        };
    } catch (e) {
        return {
            valid: false,
            resultado: null,
        };

    }
};

const protegerRuta = (allowedRoles) => {
    return (req, res, next) => {
        const token = req.headers["authorization"]
            ? req.headers["authorization"].split(" ")[1]
            : null;

        if (!token) {
            return res.status(403).send({
                error: "Token no proporcionado",
            });
        }

        const { valid, resultado } = validarToken(token);

        // Si el token no es valido
        if (!valid) {
            return res.status(403).send({
                error: "Token inválido o expirado",
            });
        }

        console.log(resultado);
        // Si el rol no es valido
        if (!allowedRoles.includes(resultado.rol)) {
            return res.status(403).send({
                error: "Acceso no autorizado para este rol: " + resultado.rol,
            });
        }
        req.usuario = resultado;
        next();
    };
};


module.exports = {
    generarToken,
    validarToken,
    protegerRuta
};