const mongoose = require('mongoose');

const consSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, "La fecha de la cita es obligatoria"]
    },
    physio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'physios',
        required: [true, "Se requiere un fisioterapeuta"]
    },
    diagnosis: {
        type: String,
        required: [true, "El diagnóstico es obligatorio"],
        minlength: [10, "El diagnóstico debe tener al menos 10 caracteres"],
        maxlength: [500, "El diagnóstico no puede exceder los 500 caracteres"]
    },
    treatment: {
        type: String,
        required: [true, "El tratamiento es obligatorio"]
    },
    observations: {
        type: String,
        maxlength: [500, "Las observaciones no pueden exceder los 500 caracteres"]
    }
});

let recordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "La referencia del paciente es obligatoria"],
        ref: 'patients'
    },
    medicalRecord: {
        type: String,
        maxlength: [1000, "El historial médico no puede exceder los 1000 caracteres"]
    },
    appointments: [consSchema],
});

let Record = mongoose.model('records', recordSchema);
module.exports = Record;
