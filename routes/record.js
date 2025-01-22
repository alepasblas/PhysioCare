const express = require("express");
const router = express.Router();
const Records = require("../models/record");
const Patient = require("../models/patient");

const getAllRecords = async () => {
  try {
    const records = await Records.find();
    return records;
  } catch (error) {
    console.error("Error al obtener los records:", error);
    throw new Error("Error al obtener los records");
  }
};

router.get('/new', async (req, res) => {
  const patients = await Patient.find().select('_id name surname'); 
  res.render('record_add', { patients });
});

// router.post('/new', async (req, res) => {
//   try {
//       const { patient, medicalRecord, appointment} = req.body;

//       const newRecord = new Record({
//           patient,
//           medicalRecord,
//           appointments: [
//             {
//                 date: appointment.date,
//                 diagnosis: appointment.diagnosis,
//                 treatment: appointment.treatment,
//                 observations: appointment.observations,
//             },
//         ],
//       });

//       await newRecord.save();
//       res.redirect('/records');
//   } catch (error) {
//       console.error(error);
//       res.status(500).send('Error al registrar el expediente médico');
//   }
// });

router.get("/", async (req, res) => {
  try {
    const resultados = await getAllRecords();
    if (resultados.length === 0) {
      return res.status(404).render("error", {
        title: "Error",
        error: "No hay registros registrados",
      });
    }
    res.status(200).render("records_list", {
      title: "Listado de Registros",
      result: resultados,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Error",
      error: "Error interno del servidor",
    });
  }
});

router.get("/find", async (req, res) => {
  const { surname } = req.query;
  try {
    const patientIds = await Patient.find({ surname }).select("_id");

    if (patientIds.length === 0) {
      return res.status(404).render("error", {
        title: "Error",
        error: "No hay pacientes con ese apellido",
      });
    }

    const recordsFinal = await Records.find({
      patient: { $in: patientIds },
    })
      .populate("patient")
      .populate("physio");

    if (recordsFinal.length === 0) {
      return res.status(404).render("error", {
        title: "Error",
        error: "No se encuentra ningún expediente",
      });
    }

    res.status(200).render("records_list", {
      title: "Registros Filtrados",
      result: recordsFinal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Error",
      error: "Error interno del servidor",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const record = await Records.find({ patient: id });

    if (!record || record.length === 0) {
      return res.status(404).render("error", {
        title: "Error",
        error: "Registro no encontrado",
      });
    }

    const rol = req.usuario?.rol;
    const userId = req.usuario?.id;

    if (rol === "patient" && id !== userId) {
      return res.status(403).render("error", {
        title: "Error",
        error: "Paciente no autorizado",
      });
    }

    res.status(200).render("record_detail", {
      title: "Detalles del Registro",
      result: record,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Error",
      error: "Error interno del servidor",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { patient, medicalRecord } = req.body;

    if (!patient || !medicalRecord) {
      return res.status(400).render("error", {
        title: "Error",
        error: "Todos los campos básicos del registro son requeridos",
      });
    }

    const newRecord = new Records({
      patient,
      medicalRecord,
    });

    const savedRecord = await newRecord.save();
    res.status(201).render("records_list", {
      title: "Registro Creado",
      result: savedRecord,
    });
  } catch (error) {
    console.error(error);
    res.status(400).render("error", {
      title: "Error",
      error: "Error al insertar el registro",
    });
  }
});

router.post("/:id/appointments", async (req, res) => {
  try {
    const userId = req.params.id;
    const { date, physio, diagnosis, treatment, observations } = req.body;

    const result = await Patient.findByIdAndUpdate(
      userId,
      {
        $push: {
          appointments: {
            date,
            physio,
            diagnosis,
            treatment,
            observations,
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(400).render("error", {
        title: "Error",
        error: "Error actualizando el registro",
      });
    }

    res.status(200).render("record_detail", {
      title: "Cita Añadida",
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Error",
      error: "Error interno del servidor",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const patientId = req.params.id;
    const result = await Records.deleteMany({ patient: patientId });

    if (!result) {
      return res.status(400).render("error", {
        title: "Error",
        error: "Error eliminando el registro",
      });
    }

    res.status(200).render("records_list", {
      title: "Registro Eliminado",
      result:result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Error",
      error: "Error interno del servidor",
    });
  }
});

module.exports = router;
