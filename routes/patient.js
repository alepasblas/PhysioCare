const express = require("express");

const upload = require(__dirname + '/../utils/uploads.js');

const router = express.Router();
const Patient = require("../models/patient");
const User = require("../models/user"); 



const getAllPatients = async () => {
  try {
    const patients = await Patient.find();
    return patients;
  } catch (error) {
    console.error("Error al obtener los pacientes:", error);
    throw new Error("Error al obtener los pacientes");
  }
};

router.get("/new", async (req, res) => {
  try{
    res.status(200).render("patient_add", { title: "Añadir paciente" });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});
router.get("/", async (req, res) => {
  try {
    const resultados = await getAllPatients();
    console.log("Pacientes encontrados:", resultados);

    if (resultados.length === 0) {
      return res.status(404).render("error", { title: "Error", error: "No hay pacientes registrados" });
    }
    res.status(200).render("patients_list", { title: "Listado de Pacientes", result: resultados });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.get("/find", async (req, res) => {
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

    res.status(200).render("patient_find", { title: "Pacientes Filtrados", result: pacientesFiltrados });
  } catch (error) {
    console.error("Error interno del servidor:", error.message);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const idPaciente = req.params.id;


    const paciente = await Patient.findById(idPaciente);

    if (!paciente) {
      return res.status(404).render("error", { title: "Error", error: "Paciente no encontrado" });
    }

    console.log(req.usuario);

    // const rol = req.usuario.rol;

    // const userId = req.usuario._id;
    // console.log(userId);

 
    // console.log(`${rol}, ${userId}`);


    // if (rol === "patient" && idPaciente !== userId) {
    //   return res.status(403).render("error", { title: "Acceso Denegado", error: "Paciente no autorizado" });
    // }

    res.status(200).render("patient_detail", { title: `Detalles de ${paciente.name}`, result: paciente });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const idPaciente = req.params.id;


    const paciente = await Patient.findById(idPaciente);

    if (!paciente) {
      return res.status(404).render("error", { title: "Error", error: "Paciente no encontrado" });
    }

    console.log(req.usuario);


    res.status(200).render("patient_edit", { result: paciente });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});


router.post("/",upload.upload.single('image'),  async (req, res) => {
  try {
    const { name, surname, birthDate, address, insuranceNumber,login,  password } = req.body;

    if (!name || !surname || !birthDate || !address || !insuranceNumber) {
      return res.status(400).render("error", { title: "Error", error: "Todos los campos básicos del paciente son requeridos" });

    }

    const newPatient = new Patient({
      name,
      surname,
      birthDate,
      address,
      insuranceNumber,
    });

    const savedPatient=await newPatient.save();

    const newUser = new User({
      login: login,  
      password: password,  
      rol: "patient",
    });

    const savedUser = await newUser.save();

    savedUser._id = savedPatient._id;


    res.status(201).render("patients_list", { title: "Paciente Registrado", result: savedPatient });

  } catch (error) { 
    console.error(error);
    res.status(400).render("error", { title: "Error", error: "Error al insertar el paciente" });
  }
});

router.post("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const { name, surname, birthDate, address, insuranceNumber } = req.body;

    const result = await Patient.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: name,
          surname: surname,
          birthDate: birthDate,
          address: address,
          insuranceNumber: insuranceNumber,
        },
      },
      { new: true, 
        runValidators:true
      }
    );

    if (!result) {
      return res.status(400).render("error", { title: "Error", error: "Error actualizando el contacto" });

    }

    res.status(200).render("patient_detail", { title: "Paciente Actualizado", result });

  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.delete("/:id",async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await Patient.findByIdAndDelete(userId);

    if (!result) {
      return res.status(404).render("error", { title: "Error", error: "Error eliminando contacto" });

    }

    res.status(200).render("patients_list", { title: "Paciente Eliminado", result:result });

  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

module.exports = router;
