const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: [true, "El nombre de usuario es obligatorio"], 
        minlength: [4, "El nombre de usuario debe tener al menos 4 caracteres"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"], 
        minlength: [7, "La contraseña debe tener al menos 7 caracteres"]
    },
    rol: {
        type: String,
        required: true,
        enum: ['admin', 'physio', 'patient']
    }
});

let User = mongoose.model('users', userSchema);
module.exports = User;
