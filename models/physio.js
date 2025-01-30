const mongoose = require('mongoose');

let physioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "The physio's name is required"], 
        minlength: [2, "The physio's name must have at least 2 characters"], 
        maxlength: [50, "The physio's name cannot exceed 50 characters"]
    },
    surname: {
        type: String,
        required: [true, "The physio's surname is required"], 
        minlength: [2, "The physio's surname must have at least 2 characters"], 
        maxlength: [50, "The physio's surname cannot exceed 50 characters"]
    },
    specialty: {
        type: String,
        required: [true, "The specialty is required"], 
        enum: {
            values: ['Sports', 'Neurological', 'Pediatric', 'Geriatric', 'Oncological'],
            message: "Specialty must be one of 'Sports', 'Neurological', 'Pediatric', 'Geriatric', or 'Oncological'"
        }
    },
    licenseNumber: {
        type: String,
        required: [true, "The license number is required"], 
        unique: true, 
        match: [/^[a-zA-Z0-9]{8}$/, "The license number must be exactly 8 alphanumeric characters"]
    },
    image: {
        type: String,
    }
});

let Physio = mongoose.model('physios', physioSchema);
module.exports = Physio;