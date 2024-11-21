const express = require("express");
const router = express.Router();
const Records = require("../models/record");
const Patient = require("../models/patient");

const auth = require(__dirname + '/../auth/auth.js');


const getAllRecords = async () => {
  try {
    const records = await Records.find();
    return records;
  } catch (error) {
    console.error("Error al obtener los records:", error);
    throw new Error("Error al obtener los records");
  }
};

router.get("/", auth.protegerRuta(['admin', 'physio']), async (req, res) => {
  try {
    const resultados = await getAllRecords();
    if (resultados.length === 0) {
      return res.status(404).send({ error: "No hay records registrados" });
    }
    res.status(200).send({ result: resultados });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

router.get("/find", auth.protegerRuta(['admin', 'physio']), async (req, res) => {
  const { surname } = req.query;
  try {
    const patientIds = await Patient.find({ surname }).select("_id");

    if (patientIds.length === 0) {
      return res
        .status(404)
        .send({ error: "No hay pacientes con ese apellido" });
    }

    const recordsFinal = await Records.find({
      patient: { $in: patientIds },
    }).populate("patient");

    if (recordsFinal.length === 0) {
      return res
        .status(404)
        .send({ error: "No se encuentra ningun expediente" });
    }

    res.status(200).send({
      result: recordsFinal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "Error interno del servidor",
    });
  }
});

router.get("/:id", auth.protegerRuta(['admin', 'physio', 'patients']), async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);

    const resultados = await getAllRecords();

    if (resultados.length === 0) {
      return res.status(404).send({ error: "No hay records registrados" });
    }

    const record = resultados.find((element) => element.patient == id);

    if (!record) {
      return res.status(404).send({ error: "Physio no encontrado" });
    }

    const rol = req.usuario.rol;
    const userId = req.usuario.id;

    if (rol === "patient" && id !== userId) {
      return res.status(403).send({
        error:"Paciente no autorizado" 
      })
    }

    res.status(200).send({ result: record });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

router.post("/", auth.protegerRuta(['admin', 'physio']), async (req, res) => {
  try {
    const { patient, medicalRecord } = req.body;

    if (!patient || !medicalRecord) {
      return res.status(400).send({
        error: "Todos los campos básicos del record son requeridos",
      });
    }

    const newRecord = new Records({
      patient,
      medicalRecord,
    });

    const savedRecord=await newRecord.save();
    res
      .status(201)
      .send({ result:savedRecord });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: "Error al insertar el record" });
  }
});

router.post("/:id/appointments", auth.protegerRuta(['admin', 'physio']), async (req, res) => {
  try {
    const userId = req.params.id;

    const { date, physio, diagnosis, treatment, observations } = req.body;

    const result = await Records.findByIdAndUpdate(
      userId,
      {
        $push: {
          appointments: {
            date:date,
            physio:physio,
            diagnosis:diagnosis,
            treatment:treatment,
            observations:observations,
          },
        },
      },
      { new: true }
    );

    if (!result) {
      res.status(400).send({
        error: "Error actualizando el record",
      });
    }

    res.status(200).send({
      resultado: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

router.delete("/:id", auth.protegerRuta(['admin', 'physio']), async (req, res) => {
  try {
    const recordId = req.params.id;

    const result = await Records.findByIdAndDelete(recordId);

    if (!result) {
      res.status(400).send({
        error: "Error eliminando el record",
      });
    }

    res
      .status(200)
      .send({ resultado: result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

module.exports = router;
