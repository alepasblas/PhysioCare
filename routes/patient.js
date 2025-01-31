const express = require("express");

const upload = require(__dirname + '/../utils/uploads.js');

const router = express.Router();
const Patient = require("../models/patient");
const User = require("../models/user"); 
const { rolesPerm } = require("../middleware/roles");



const getAllPatients = async () => {
  try {
    const patients = await Patient.find();
    return patients;
  } catch (error) {
    console.error("Error al obtener los pacientes:", error);
    throw new Error("Error al obtener los pacientes");
  }
};

router.delete("/:id",rolesPerm('admin', 'physio'),async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await Patient.findByIdAndDelete(userId);

    if (!result) {
      console.log("3");
      return res.status(404).render("error", { title: "Error", error: "Error eliminando contacto" });
      
    }
    
    res.status(200).redirect("/patients"); 
    // res.status(200).render("patient/patients_list", { title: "Paciente Eliminado", result:result });

  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.get("/",rolesPerm('admin', 'physio'), async (req, res) => {
  try {
    const resultados = await getAllPatients();

    if (resultados.length === 0) {
      return res.status(404).render("error", { title: "Error", error: "No hay pacientes registrados" });
    }
    res.status(200).render("patient/patients_list", { title: "Listado de Pacientes", result: resultados });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.get("/new",rolesPerm('admin', 'physio'), async (req, res) => {
  try{
    res.status(200).render("patient/patient_add", { title: "Añadir paciente" });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.get("/find",rolesPerm('admin', 'physio'), async (req, res) => {
  try {
    const resultados = await getAllPatients();
    const { surname } = req.query;

    const pacientesFiltrados = surname
      ? resultados.filter((element) => element.surname.includes(surname))
      : resultados;

    if (pacientesFiltrados.length === 0) {
      return res
        .status(404)
        .render("error", { title: "Error", error: "No se encontraron pacientes que coincidan" });
    }

    res.status(200).render("patient/patient_find", { title: "Pacientes Filtrados", result: pacientesFiltrados });
  } catch (error) {
    console.error("Error interno del servidor:", error.message);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});



router.get("/:id",rolesPerm('admin', 'physio', 'patient'), async (req, res) => {
  try {
    const idPaciente = req.params.id;


    const paciente = await Patient.findById(idPaciente);

    if (!paciente) {
      return res.status(404).render("error", { title: "Error", error: "Paciente no encontrado" });
    }

    console.log(req.user);

    const rol = req.user.rol;
    

    const userId = req.user.id;
    console.log(userId);

 
    console.log(`${rol}, ${userId}`);


    if (idPaciente !== userId) {
      return res.status(403).render("error", { title: "Acceso Denegado", error: "Paciente no autorizado" });
    }

    res.status(200).render("patient/patient_detail", { title: `Detalles de ${paciente.name}`, result: paciente });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor: "+error });
  }
});

router.get("/:id/edit",rolesPerm('admin', 'physio'), async (req, res) => {
  try {
    const idPaciente = req.params.id;


    const paciente = await Patient.findById(idPaciente);

    if (!paciente) {
      return res.status(404).render("error", { title: "Error", error: "Paciente no encontrado" });
    }

    console.log(req.usuario);


    res.status(200).render("patient/patient_edit", { result: paciente });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});


router.post("/",rolesPerm('admin', 'physio'),upload.upload.single('image'),  async (req, res) => {
  const { name, surname, birthDate, address, insuranceNumber,login,  password } = req.body;
  try {

    if (!name || !surname || !birthDate || !address || !insuranceNumber) {
      return res.status(400).render("error", { title: "Error", error: "Todos los campos básicos del paciente son requeridos" });

    }
    let image = null;
    if (req.file) {
        image = `/public/uploads/${req.file.filename}`;
    }
    const newPatient = new Patient({
      name,
      surname,
      birthDate,
      address,
      insuranceNumber,
      image,
    });

    const savedPatient=await newPatient.save();

    const newUser = new User({
      _id: savedPatient._id,
      login: login,  
      password: password,  
      rol: "patient",
    });

    const savedUser = await newUser.save();

    savedUser._id = savedPatient._id;

    res.status(201).redirect("/patients"); 

    // res.status(201).render("patient/patients_list", { title: "Paciente Registrado", result: savedPatient });

  } catch (error) { 
    const errors = { general: "Error al crear el paciente" };

      if (error.name === 'ValidationError' || error.code === 11000) {
        if (error.errors) {
            if (error.errors.name) errors.name = error.errors.name.message;
            if (error.errors.surname) errors.surname = error.errors.surname.message;
            if (error.errors.birthDate) errors.birthDate = error.errors.birthDate.message;
            if (error.errors.insuranceNumber) errors.insuranceNumber = error.errors.insuranceNumber.message;
            if (error.errors.address) errors.address = error.errors.address.message;
            if (error.errors.login) errors.login = error.errors.login.message;
            if (error.errors.password) errors.password = error.errors.password.message;
        }

        if (error.code === 11000) {
            if (error.message.includes('insuranceNumber')) {
                errors.insuranceNumber = "El numero de seguro tiene que ser unico.";
            }
            if (error.message.includes('login')) {
                errors.login = "El login tiene que ser unico.";
            }
        }

        return res.render('patient/patient_add', {
            title: "Error al añadir paciente",
            patient: { name, surname, birthDate, address, insuranceNumber, login },
            errors
        });
      }
    res.status(400).render("error", { title: "Error", error: "Error al insertar el paciente" });
  }
});

router.post("/:id",rolesPerm('admin', 'physio'), upload.upload.single('image'), async (req, res) => {
  const { name, surname, birthDate, address, insuranceNumber } = req.body;
  const userId = req.params.id;
  try {

    const data = {};

    const fields = { name, surname, birthDate, address, insuranceNumber };

    for (const name in fields) {
        if (fields[name]) data[name] = fields[name];
    }
    
    if (req.file) data.image = `/public/uploads/${req.file.filename}`;
    

    const result = await Patient.findByIdAndUpdate(
      userId, data,
      { new: true, 
        runValidators:true
      }
    );

    if (!result) {
      return res.status(400).render("error", { title: "Error", error: "Error actualizando el contacto" });

    }

    res.status(200).render("patient/patient_detail", { title: "Paciente Actualizado", result });

  } catch (error) {
    const errors = { general: "Error al modificar el paciente." };
    if (error.name === 'ValidationError' || error.code === 11000) {
      if (error.errors) {
          if (error.errors.name) errors.name = error.errors.name.message;
          if (error.errors.surname) errors.surname = error.errors.surname.message;
          if (error.errors.birthDate) errors.birthDate = error.errors.birthDate.message;
          if (error.errors.insuranceNumber) errors.insuranceNumber = error.errors.insuranceNumber.message;
          if (error.errors.address) errors.address = error.errors.address.message;
      }

      if (error.code === 11000) errors.insuranceNumber = "El numero de seguro tiene que ser unico.";

      return res.render('patient/patient_edit', {
          title: "Error al editar paciente",
          patient: { _id: userId, name, surname, birthDate, address, insuranceNumber },
          errors
      });
   }
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});


module.exports = router;
