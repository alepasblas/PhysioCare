const express = require("express");

const upload = require(__dirname + '/../utils/uploads.js');

const router = express.Router();
const Physios = require("../models/physio");
const User = require("../models/user"); 
const { rolesPerm } = require("../middleware/roles");

const getAllPhysios = async () => {
  try {
    const physios = await Physios.find();
    return physios;
  } catch (error) {
    console.error("Error al obtener los physios:", error);
    throw new Error("Error al obtener los physios");
  }
};

router.get("/new",rolesPerm('admin'), async (req, res) => {
  try{
    res.status(200).render("physio/physio_add", { title: "Añadir physio" });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.get("/",rolesPerm('admin', 'physio', 'patient'), async (req, res) => {
  try {
    const resultados = await getAllPhysios();
    if (resultados.length === 0) {
      return res.status(404).render("error", { title: "Error", error: "No hay physios registrados" });
    }
    
    res.status(200).render("physio/physios_list", { title: "Listado de Fisioterapeutas", result: resultados });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.get("/find",rolesPerm('admin'), async (req, res) => {
  try {
    const { specialty } = req.query;

    const query = specialty ? { specialty } : {};
    const fisiosFiltrados = await Physios.find(query);

    if (fisiosFiltrados.length === 0) {
      return res.status(404).render("error", { title: "Error", error: "No se encontraron fisioterapeutas que coincidan" });
    }

    res.status(200).render("physio/physio_find", { title: "Fisioterapeutas Filtrados", result: fisiosFiltrados });
  } catch (error) {
    console.error("Error interno del servidor:", error.message);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.get("/:id",rolesPerm('admin', 'physio', 'patient'), async (req, res) => {
  try {
    const id = req.params.id;
    const physio = await Physios.findById(id);

    console.log("Fisioterapeuta encontrado:", physio);

    if (!physio) {
      return res.status(404).render("error", { title: "Error", error: "Fisioterapeuta no encontrado" });
    }

    res.status(200).render("physio/physio_detail", { title: `Detalles de ${physio.name}`, result: physio });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

router.post("/",rolesPerm('admin'),upload.upload.single('image'), async (req, res) => {
  const { name, surname, specialty, licenseNumber, login, password } = req.body;
  try {

    if (!name || !surname || !specialty || !licenseNumber) {
      return res.status(400).render("error", { title: "Error", error: "Todos los campos básicos del fisioterapeuta son requeridos" });
    }
    let image = null;
    if (req.file) {
        image = `/public/uploads/${req.file.filename}`;
    }
    const newPhysio = new Physios({
      name,
      surname,
      specialty,
      licenseNumber, 
      image
    });

    const savedPhysio = await newPhysio.save();

    const newUser = new User({
      _id: savedPhysio._id,
      login: login,
      password: password,
      rol: "physio",
    });

    const savedUser = await newUser.save();

    savedUser._id = savedPhysio._id;

    res.status(200).redirect("/physios"); 

    // res.status(201).render("physio/physios_list", { title: "Fisioterapeuta Registrado", result: savedPhysio });
  } catch (error) {
    const errors = { general: "Error al registrar el fisioterapeuta" };

        if (error.name === 'ValidationError' || error.code === 11000) {
            if (error.errors) {
                if (error.errors.name) errors.name = error.errors.name.message;
                if (error.errors.surname) errors.surname = error.errors.surname.message;
                if (error.errors.specialty) errors.specialty = error.errors.specialty.message;
                if (error.errors.licenseNumber) errors.licenseNumber = error.errors.licenseNumber.message;
                if (error.errors.login) errors.login = error.errors.login.message;
                if (error.errors.password) errors.password = error.errors.password.message;
            }

            if (error.code === 11000) {
                if (error.message.includes('licenseNumber')) {
                    errors.licenseNumber = "El número de licencia debe ser único.";
                }
                if (error.message.includes('login')) {
                    errors.login = "EL login debe ser único.";
                }
            }

            return res.render('physio/physio_add', {
                title: "Error al añadir fisioterapeuta",
                physio: {  name, surname, specialty, licenseNumber, login, password },
                errors
            });
        }

    res.status(400).render("error", { title: "Error", error: mensaje });
  }
});


router.get("/:id/edit", rolesPerm('admin'),async (req, res) => {
  try {
    const idPhysio = req.params.id;


    const physio = await Physios.findById(idPhysio);

    if (!physio) {
      return res.status(404).render("error", { title: "Error", error: "Fisio no encontrado" });
    }

    console.log(req.usuario);


    res.status(200).render("physio/physios_edit", { result: physio });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});


router.post("/:id", rolesPerm('admin'), upload.upload.single('image'), async (req, res) => {
  const { name, surname, specialty, licenseNumber } = req.body;
  const userId = req.params.id;
  try {

    const data = {};

    const fields = { name, surname, specialty, licenseNumber};

    for (const name in fields) {
      if (fields[name]) data[name] = fields[name];
  }

  if (req.file) data.image = `/public/uploads/${req.file.filename}`;


    const result = await Physios.findByIdAndUpdate(
      userId,data,
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(400).render("error", { title: "Error", error: "Error actualizando el fisioterapeuta" });
    }
    res.status(200).redirect("/physios"); 

    // res.status(200).render("physio/physios_list", { title: "Fisioterapeuta Actualizado", result });
  } catch (error) {
    const errors = { general: "Error al modificar el fisio" };

        if (error.name === 'ValidationError' || error.code === 11000) {
            if (error.errors) {
                if (error.errors.name) errors.name = error.errors.name.message;
                if (error.errors.surname) errors.surname = error.errors.surname.message;
                if (error.errors.specialty) errors.specialty = error.errors.specialty.message;
                if (error.errors.licenseNumber) errors.licenseNumber = error.errors.licenseNumber.message;
            }

            if (error.code === 11000) errors.licenseNumber = "El número de licencia debe ser único.";

            return res.render('physio/physios_edit', {
                title: "Error al editar fisioterapeuta",
                physio: { _id: userId, name, surname, specialty, licenseNumber  },
                errors
            });
        }
    res.status(500).render("error", { title: "Error", error: mensaje });
  }
});

router.delete("/:id",rolesPerm('admin'), async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await Physios.findByIdAndDelete(userId);

    if (!result) {
      return res.status(404).render("error", { title: "Error", error: "Error eliminando el fisioterapeuta" });
    }

    res.status(200).redirect("/physios"); 

    // res.status(200).render("physios/phyios_list", { title: "Fisioterapeuta Eliminado", result:result  });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", error: "Error interno del servidor" });
  }
});

module.exports = router;
