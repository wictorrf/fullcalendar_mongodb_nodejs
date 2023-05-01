const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const AppointmentService = require("./services/AppointmentService");

app.use(express.static("public")); //uso de arquivos estaticos
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/agendamento", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.get("/", (req, res) => {
    res.render("index");
});
app.get("/cadastro", (req, res) => {
    res.render("create");
})
app.post("/create", async (req, res) => {
    let status = await AppointmentService.Create(
        req.body.name,
        req.body.email,
        req.body.cpf,
        req.body.date,
        req.body.time,
        req.body.description
    )
    if (status) {
        res.redirect("/");
    } else {
        res.send("ocorreu uma falha!");
    }
})
app.get("/getCalendar", async (req, res) => {
    let appointments = await AppointmentService.GetAll(false);
    res.json(appointments);
})

app.get("/event/:id",async (req,res) => {
    var appointment = await AppointmentService.GetById(req.params.id);
    res.render("event",{appo: appointment});
})

app.post("/finish", async (req,res) => {
    let id = req.body.id;
    let result = await AppointmentService.Finish(id);
    res.redirect("/");
})
app.get("/list", async (req,res) => {
    let appos = await AppointmentService.GetAll(true);
    res.render("list",{appos});
})
app.get("/searchresult", async (req,res) => {
    let appos = await AppointmentService.Search(req.query.search);
    res.render("list",{appos});
})

setInterval(async () => {
    await AppointmentService.SendNotification();
}, 5000) // 5 min

app.listen(8080, () => {
    console.log("app rodando!");
})