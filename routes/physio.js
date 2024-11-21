const express = require("express");
const router = express.Router();
const Physios = require("../models/physio");

const auth = require(__dirname + '/../auth/auth.js');


const getAllPhysios = async () => {
  try {
    const physios = await Physios.find();
    return physios;
  } catch (error) {
    console.error("Error al obtener los physios:", error);
    throw new Error("Error al obtener los physios");
  }
};

router.get("/", auth.protegerRuta(['admin', 'physio', 'patient' ]), async (req, res) => {
  try {
    const resultados = await getAllPhysios();
    if (resultados.length === 0) {
      return res.status(404).send({ error: "No hay physios registrados" });
    }
    res.status(200).send({ result: resultados });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

router.get("/find", auth.protegerRuta(['admin', 'physio', 'patient' ]), async (req, res) => {
  try {
    const { specialty } = req.query;

    const resultados = await getAllPhysios();

    const fisiosFiltrados = specialty
      ? resultados.filter((element) => element.specialty===specialty)
      : resultados;

    if (fisiosFiltrados.length === 0) {
      return res
        .status(404)
        .send({ error: "No se encontraron fisios que coincidan" });
    }

    res.status(200).send({ result: fisiosFiltrados });
  } catch (error) {
    console.error("Error interno del servidor:", error.message);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

router.get("/:id", auth.protegerRuta(['admin', 'physio', 'patient' ]), async (req, res) => {
  try {
    const id = req.params.id;

    const resultados = await getAllPhysios();

    if (resultados.length === 0) {
      return res.status(404).send({ error: "No hay physios registrados" });
    }

    const physio = resultados.find((element) => element._id == id);

    if (!physio) {
      return res.status(404).send({ error: "Physio no encontrado" });
    }

    res.status(200).send({ result: physio });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

router.post("/", auth.protegerRuta(['admin']), async (req, res) => {
  try {
    const { name, surname, specialty, licenseNumber } = req.body;

    if (!name || !surname || !specialty || !licenseNumber) {
      return res.status(400).send({
        error: "Todos los campos básicos del physio son requeridos",
      });
    }

    const newPhysio = new Physios({
      name,
      surname,
      specialty,
      licenseNumber
    });

    const savedPhysio = await newPhysio.save();
    res
      .status(201)
      .send({ result: savedPhysio});
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: "Error al insertar el physio" });
  }
});

router.put("/:id", auth.protegerRuta(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("ID recibido:", req.params.id);

    const { name, surname, specialty, licenseNumber } = req.body;

    const result = await Physios.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: name,
          surname: surname,
          specialty: specialty,
          licenseNumber: licenseNumber
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
      result: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

router.delete("/:id", auth.protegerRuta(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await Physios.findByIdAndDelete(userId);

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
