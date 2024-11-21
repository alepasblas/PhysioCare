const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");

const auth = require(__dirname + '/../auth/auth.js');


const getAllPatients = async () => {
  try {
    const patients = await Patient.find();
    return patients;
  } catch (error) {
    console.error("Error al obtener los pacientes:", error);
    throw new Error("Error al obtener los pacientes");
  }
};

router.get("/", auth.protegerRuta(['admin', 'physio']), async (req, res) => {
  try {
    const resultados = await getAllPatients();
    if (resultados.length === 0) {
      return res.status(404).send({ error: "No hay pacientes registrados" });
    }
    res.status(200).send({ result: resultados });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

router.get("/find", auth.protegerRuta(['admin', 'physio' ]), async (req, res) => {
  try {
    const resultados = await getAllPatients();
    const { surname } = req.query;

    const pacientesFiltrados = surname
      ? resultados.filter((element) => element.surname.includes(surname))
      : resultados;

    if (pacientesFiltrados.length === 0) {
      return res
        .status(404)
        .send({ error: "No se encontraron pacientes que coincidan" });
    }

    res.status(200).send({ result: pacientesFiltrados });
  } catch (error) {
    console.error("Error interno del servidor:", error.message);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

router.get("/:id", auth.protegerRuta(['admin', 'physio', 'patient']), async (req, res) => {
  try {
    const idPaciente = req.params.id;
    console.log(idPaciente);

    const resultados = await getAllPatients();

    if (resultados.length === 0) {
      return res.status(404).send({ error: "No hay pacientes registrados" });
    }

    const paciente = resultados.find((element) => element._id == idPaciente);

    if (!paciente) {
      return res.status(404).send({ error: "Paciente no encontrado" });
    }
    console.log(req.usuario);
    const rol = req.usuario.rol;
    const userId = req.usuario.id;

    console.log(rol+" , "+userId);

    if (rol === "patient" && idPaciente !== userId) {
      return res.status(403).send({
        error:"Paciente no autorizado"
      })
    }

    

    res.status(200).send({ result: paciente });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

router.post("/", auth.protegerRuta(['admin', 'physio' ]), async (req, res) => {
  try {
    const { name, surname, birthDate, address, insuranceNumber } = req.body;

    if (!name || !surname || !birthDate || !insuranceNumber) {
      return res.status(400).send({
        error: "Todos los campos básicos del paciente son requeridos",
      });
    }

    const newPatient = new Patient({
      name,
      surname,
      birthDate,
      address,
      insuranceNumber,
    });

    const savedPatient=await newPatient.save();
    res
      .status(201)
      .send({ result: savedPatient});
  } catch (error) { 
    console.error(error);
    res.status(400).send({ error: "Error al insertar el paciente" });
  }
});

router.put("/:id", auth.protegerRuta(['admin', 'physio' ]), async (req, res) => {
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
      { new: true }
    );

    if (!result) {
      res.status(400).send({
        error: "Error actualizando el contacto",
      });
    }

    res.status(200).send({
      status:200,
      result: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

router.delete("/:id", auth.protegerRuta(['admin', 'physio' ]), async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await Patient.findByIdAndDelete(userId);

    if (!result) {
      res.status(400).send({
        error: "Error eliminando contacto",
      });
    }

    res
      .status(200)
      .send({ result: result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

module.exports = router;
