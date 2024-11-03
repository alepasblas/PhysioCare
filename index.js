const express = require('express');
const mongoose = require('mongoose');
const patientRouter = require('./routes/patient');

mongoose.connect('mongodb://127.0.0.1:27017/physiocare')

let app = express();

app.use(express.json());

app.use('/patients', patientRouter); 

app.listen(8080, () => {
    console.log('Servidor iniciado en el puerto 8080');
});