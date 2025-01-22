const express = require("express");

const upload = require(__dirname + '/../utils/uploads.js');

const router = express.Router();
const Physios = require("../models/physio");
const User = require("../models/user"); 

const getAllPhysios = async () => {
  try {
    const physios = await Physios.find();
    return physios;
  } catch (error) {
    console.error("Error al obtener los physios:", error);
    throw new Error("Error al obtener los physios");
  }
};

router.get("/new", async (req, res) => {
  try{
    res.status(200).render("physio_add", { title: "Añadir physio" });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.get("/", async (req, res) => {
  try {
    const resultados = await getAllPhysios();
    if (resultados.length === 0) {
      return res.status(404).render("error", { title: "Error", error: "No hay physios registrados" });
    }
    res.status(200).render("physios_list", { title: "Listado de Fisioterapeutas", result: resultados });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.get("/find", async (req, res) => {
  try {
    const { specialty } = req.query;

    const query = specialty ? { specialty } : {};
    const fisiosFiltrados = await Physios.find(query);

    if (fisiosFiltrados.length === 0) {
      return res.status(404).render("error", { title: "Error", error: "No se encontraron fisioterapeutas que coincidan" });
    }

    res.status(200).render("physio_find", { title: "Fisioterapeutas Filtrados", result: fisiosFiltrados });
  } catch (error) {
    console.error("Error interno del servidor:", error.message);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const physio = await Physios.findById(id);

    if (!physio) {
      return res.status(404).render("error", { title: "Error", error: "Fisioterapeuta no encontrado" });
    }

    res.status(200).render("physio_detail", { title: `Detalles de ${physio.name}`, result: physio });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.post("/",upload.upload.single('image'), async (req, res) => {
  try {
    const { name, surname, specialty, licenseNumber, login, password } = req.body;

    console.log(req.body); // Verificar qué datos se envían

    if (!name || !surname || !specialty || !licenseNumber) {
      return res.status(400).render("error", { title: "Error", error: "Todos los campos básicos del fisioterapeuta son requeridos" });
    }

    const newPhysio = new Physios({
      name,
      surname,
      specialty,
      licenseNumber
    });

    const savedPhysio = await newPhysio.save();

    const newUser = new User({
      login: login,
      password: password,
      rol: "physio",
    });

    const savedUser = await newUser.save();

    savedUser._id = savedPhysio._id;

    res.status(201).render("physios_list", { title: "Fisioterapeuta Registrado", result: savedPhysio });
  } catch (error) {
    console.error(error);
    res.status(400).render("error", { title: "Error", error: "Error al insertar el fisioterapeuta" });
  }
});


router.get("/:id/edit", async (req, res) => {
  try {
    const idPhysio = req.params.id;


    const physio = await Physios.findById(idPhysio);

    if (!physio) {
      return res.status(404).render("error", { title: "Error", error: "Fisio no encontrado" });
    }

    console.log(req.usuario);


    res.status(200).render("physios_edit", { result: physio });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});


router.post("/:id", async (req, res) => {
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
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(400).render("error", { title: "Error", error: "Error actualizando el fisioterapeuta" });
    }

    res.status(200).render("physios_list", { title: "Fisioterapeuta Actualizado", result });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await Physios.findByIdAndDelete(userId);

    if (!result) {
      return res.status(404).render("error", { title: "Error", error: "Error eliminando el fisioterapeuta" });
    }

    res.status(200).render("phyios_list", { title: "Fisioterapeuta Eliminado", result:result  });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

module.exports = router;
