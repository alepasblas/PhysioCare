const mongoose = require('mongoose');

let patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 2,
        maxlength: 50,
    },
    surname: {
        type: String,
        required: true,
        maxlength: 2,
        maxlength: 50,
    },
    birthDate: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        maxlength: 100,

    },
    insuranceNumber:{
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9]{9}$/,

    }, 
    image: {
        type: String,
    }
});

let Patient = mongoose.model('patients', patientSchema);
module.exports = Patient;