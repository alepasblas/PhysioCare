const mongoose = require('mongoose');

let patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "The patient's name is required"], 
        minlength: [2, "The patient's name must have at least 2 characters"], 
        maxlength: [50, "The patient's name cannot exceed 50 characters"]
    },
    surname: {
        type: String,
        required: [true, "The patient's surname is required"], 
        minlength: [2, "The patient's surname must have at least 2 characters"], 
        maxlength: [50, "The patient's surname cannot exceed 50 characters"]
    },
    birthDate: {
        type: Date,
        required: [true, "The patient's birth date is required"]
    },
    address: {
        type: String,
        maxlength: [100, "The address cannot exceed 100 characters"]
    },
    insuranceNumber:{
        type: String,
        required: [true, "The insurance number is required"], 
        unique: true, 
        match: [/^[a-zA-Z0-9]{9}$/, "The insurance number must be exactly 9 alphanumeric characters"]
    }, 
    image: {
        type: String,
    }
});

let Patient = mongoose.model('patients', patientSchema);
module.exports = Patient;