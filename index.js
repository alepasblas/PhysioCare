const express = require("express");
const mongoose = require("mongoose");

const dotenv = require("dotenv");
const nunjucks = require("nunjucks");
const path = require("path");

const patientRouter = require("./routes/patient");
const physioRouter = require("./routes/physio");
const recordRouter = require("./routes/record");

dotenv.config();
mongoose.connect(process.env.URL);

let app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.set("view engine", "njk");

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get("/", (req, res) => {
  res.redirect("/public/index.html");
});
  
app.use("/public", express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/node_modules/bootstrap/dist"));
app.use(express.static(__dirname + "/public/uploads"));

app.use("/patients", patientRouter);
app.use("/physios", physioRouter);
app.use("/records", recordRouter);

app.listen(process.env.PUERTO, () => {
  console.log("Servidor iniciado en el puerto 8080");
});
