const mongoose = require('mongoose');

let patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre del paciente es obligatorio"], 
        minlength: [2, "El nombre del paciente debe tener al menos 2 caracteres"], 
        maxlength: [50, "El nombre del paciente no puede exceder los 50 caracteres"]
    },
    surname: {
        type: String,
        required: [true, "El apellido del paciente es obligatorio"], 
        minlength: [2, "El apellido del paciente debe tener al menos 2 caracteres"], 
        maxlength: [50, "El apellido del paciente no puede exceder los 50 caracteres"]
    },
    birthDate: {
        type: Date,
        required: [true, "La fecha de nacimiento del paciente es obligatoria"]
    },
    address: {
        type: String,
        maxlength: [100, "La dirección no puede exceder los 100 caracteres"]
    },
    insuranceNumber: {
        type: String,
        required: [true, "El número de seguro es obligatorio"], 
        unique: true, 
        match: [/^[a-zA-Z0-9]{9}$/, "El número de seguro debe tener exactamente 9 caracteres alfanuméricos"]
    }, 
    image: {
        type: String,
    }
});

let Patient = mongoose.model('patients', patientSchema);
module.exports = Patient;
