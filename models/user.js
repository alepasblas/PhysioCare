const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: [true, "The login's name is required"], 
        minlength: [4, "The login must have at least 4 characters"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "The password is required"], 
        minlength: [7, "The password must have at least 7 characters"]
    },
    rol: {
        type: String,
        required: true,
        enum: ['admin', 'physio', 'patient']
    }
});

let User = mongoose.model('users', userSchema);
module.exports = User;

