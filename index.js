const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const dotenv = require("dotenv");
const nunjucks = require("nunjucks");
const path = require("path");

const patientRouter = require("./routes/patient");
const physioRouter = require("./routes/physio");
const recordRouter = require("./routes/record");
const authRouter = require("./routes/auth");
const SEC = process.env.SECRET;
const methodOverride = require("method-override");

dotenv.config();
mongoose.connect(process.env.URL);

let app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.set("view engine", "njk");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

app.use("/public", express.static(__dirname + "/public"));

app.use(express.static(__dirname + "/node_modules/bootstrap/dist"));
app.use(express.static(__dirname + "/public/uploads"));

app.use(
  session({
    secret: "1234",
    resave: true,
    saveUninitialized: false,
    expires: new Date(Date.now() + 30 * 60 * 1000),
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

let autenticacion = (req, res, next) => {
  if (req.session && req.session.usuario) return next();
  else res.render("login");
};

app.use((req, res, next) => {
  if (!req.session.user) {
    req.session.user = {};
  }
  next();
});
app.get("/", (req, res) => {
  res.redirect("/index");
});
app.get("/index", (req, res) => {
  res.render('index', { 
    title: "Index" 
});});

let rol = (rol) => {
  return (req, res, next) => {
    if (rol === req.session.rol) next();
    else res.render("login");
  };
};

app.use("/patients", patientRouter);
app.use("/physios", physioRouter);
app.use("/records", recordRouter);
app.use("/login", authRouter);

app.listen(process.env.PUERTO, () => {
  console.log("Servidor iniciado en el puerto 8080");
});
