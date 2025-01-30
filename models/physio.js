const mongoose = require('mongoose');

let physioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre del fisioterapeuta es obligatorio"], 
        minlength: [2, "El nombre del fisioterapeuta debe tener al menos 2 caracteres"], 
        maxlength: [50, "El nombre del fisioterapeuta no puede exceder los 50 caracteres"]
    },
    surname: {
        type: String,
        required: [true, "El apellido del fisioterapeuta es obligatorio"], 
        minlength: [2, "El apellido del fisioterapeuta debe tener al menos 2 caracteres"], 
        maxlength: [50, "El apellido del fisioterapeuta no puede exceder los 50 caracteres"]
    },
    specialty: {
        type: String,
        required: [true, "La especialidad es obligatoria"], 
        enum: {
            values: ['Sports', 'Neurological', 'Pediatric', 'Geriatric', 'Oncological'],
            message: "La especialidad debe ser 'Sports', 'Neurological', 'Pediatric', 'Geriatric' or 'Oncological'"
        }
    },
    licenseNumber: {
        type: String,
        required: [true, "El número de licencia es obligatorio"], 
        unique: true, 
        match: [/^[a-zA-Z0-9]{8}$/, "El número de licencia debe tener exactamente 8 caracteres alfanuméricos"]
    },
    image: {
        type: String,
    }
});

let Physio = mongoose.model('physios', physioSchema);
module.exports = Physio;
