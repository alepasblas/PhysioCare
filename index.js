const express = require('express');
const mongoose = require('mongoose');
const patientRouter = require('./routes/patient');
const physioRouter = require('./routes/physio');
const recordRouter = require('./routes/record');
const authRouter = require('./routes/auth');
const dotenv = require("dotenv");

dotenv.config();
mongoose.connect(process.env.URL)

let app = express();

app.use(express.json());

app.use('/patients', patientRouter); 
app.use('/physios', physioRouter); 
app.use('/records', recordRouter); 
app.use('/auth', authRouter); 

app.listen(process.env.PUERTO, () => {
    console.log('Servidor iniciado en el puerto 8080');
});



//EN el post de patient physio crear user
//Implementar el bdcrypt