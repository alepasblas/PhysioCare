const express = require("express");
const router = express.Router();
const Records = require("../models/record");
const Patient = require("../models/patient");
const Physios = require("../models/physio");
const { rolesPerm } = require("../middleware/roles");

const getAllRecords = async () => {
  try {
    const records = await Records.find();
    return records;
  } catch (error) {
    console.error("Error al obtener los records:", error);
    throw new Error("Error al obtener los records");
  }
};
router.get("/new", rolesPerm("admin", "physio"), async (req, res) => {
  try {
    const { patientId } = req.query;

    const patients = await Patient.aggregate([
      {
        $lookup: {
          from: "records",
          localField: "_id",
          foreignField: "patient",
          as: "record",
        },
      },
      {
        $match: { record: { $size: 0 } },
      },
    ]);

    res.render("record/record_add", {
      patientId: patientId,
      patients,
    });
  } catch (error) {
    console.error( error);
    res
      .status(500)
      .render("error", { title: "Error", error: "Error al obtener pacientes" });
  }
});

router.get("/" ,rolesPerm('admin', 'physio'), async (req, res) => {
  try {
    const resultados = await getAllRecords();
    if (resultados.length === 0) {
      return res.status(404).render("error", {
        title: "Error",
        error: "No hay registros registrados",
      });
    }
    res.status(200).render("record/records_list", {
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

router.get("/find",rolesPerm('admin', 'physio'), async (req, res) => {
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

    res.status(200).render("record/records_list", {
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

router.get("/:id",rolesPerm('admin', 'physio', 'patient'), async (req, res) => {
  try {
    const id = req.params.id;
    const record = await Records.findOne({ patient: id })
    .populate('patient', 'name surname')
    .populate('appointments.physio', 'name');;

    console.log(`${record.patient.name} ${record.patient.surname}`);

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

    res.status(200).render("record/record_detail", {
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

router.get("/:id/appointments/new",rolesPerm('admin', 'physio'), async (req, res) => {

  const id = req.params.id;

  try {
      const record = await Records.findOne({ patient: id }).populate("patient");
      if (!record) {
          return res.status(404).render("error", {
              title: "No se encontró el registro",
              error: `No se encontro registro con id: ${id}`,
          });
      }

      const physios = await Physios.find();

      res.render("record/record_addCita", {
          title: "Añadir cita",
          record,
          physios
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error", {
        title: "Error",
        error: "Error interno del servidor",
      });
    }
  });

router.post("/",rolesPerm('admin', 'physio'),async (req, res) => {
  try {
    const { patientId, medicalRecord } = req.body;

    console.log(patientId, medicalRecord);

    if (!patientId) {
      return res.status(400).render("error", {
        title: "Error",
        error: "El id es necesario",
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
        return res.status(404).render('error', {
            title: "Paciente no encontrado",
            error: `Paciente no encontrado con ID: ${patientId}`
          });
    }
    const newRecord = new Records({
      patient: patient._id,
      medicalRecord,
      appointments: []

    });

    await newRecord.save();

    res.status(201).redirect("/records"); 
    // res.status(201).render("record/records_list", {
    //   title: "Registro Creado",
    //   result: savedRecord,
    // });
  } catch (error) {
    console.error(error);
    res.status(400).render("error", {
      title: "Error",
      error: "Error al insertar el registro",
    });
  }
});

router.post("/:id/appointments",rolesPerm('admin', 'physio'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { date, physio, diagnosis, treatment, observations } = req.body;

    const appointment = {
      date,
      physio,
      diagnosis,
      treatment,
      observations,
  };
  
  console.log(appointment); 
    const result = await Records.findOne({ patient: userId });


    if (!result) {
      return res.status(400).render("error", {
        title: "Error",
        error: "Error actualizando el registro",
      });
    }

    result.appointments.push(appointment);
    await result.save();

    console.log(result);

    res.status(200).redirect("/records"); 

    // res.status(200).render("record/record_detail", {
    //   title: "Cita Añadida",
    //   result,
    // });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Error",
      error: "Error interno del servidor",
    });
  }
});

router.delete("/:id",rolesPerm('admin', 'physio'), async (req, res) => {
  try {
    const patientId = req.params.id;
    const result = await Records.deleteMany({ patient: patientId });

    if (!result) {
      return res.status(400).render("error", {
        title: "Error",
        error: "Error eliminando el registro",
      });
    }

    res.status(200).redirect("/records"); 

    // res.status(200).render("record/records_list", {
    //   title: "Registro Eliminado",
    //   result:result,
    // });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Error",
      error: "Error interno del servidor",
    });
  }
});

module.exports = router;
