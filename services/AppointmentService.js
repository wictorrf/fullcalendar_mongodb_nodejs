const appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const AppointmentFactory = require("../factories/AppointmentFactory");
const nodemailer = require("nodemailer");

const Appo = mongoose.model("Appointment", appointment)

class AppointmentService {

    async Create(name, email, cpf, date, time, description,notified){
        let newAppo = new Appo({name,email,cpf,date,time,description, finished: false,notified: false});
        try {
            await newAppo.save();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    async GetAll(showFinished){
        if (showFinished) {
            return await Appo.find();
        } else {
            let appos = await Appo.find({'finished': false});
            let appointments = [];
            appos.forEach(appointment => {
                if (appointment.date != undefined) {
                    appointments.push(AppointmentFactory.build(appointment));
                }
            });
            return appointments;
        }
    }
    async GetById(id){
        try {
            let event = await Appo.findOne({'_id': id});
            return event;
        } catch (error) {
            console.log(err);
        }
    }
    async Finish(id){
        try {
            await Appo.findByIdAndUpdate(id,{finished: true}) // buscar e atualizar somente o campo finished.
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    async Search(query){
        try {
            let appos = await Appo.find().or([{email: query},{cpf: query}]);
            return appos;
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    async SendNotification(){
        let appos = await this.GetAll(false);
        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "",
              pass: ""
            }
          });
        appos.forEach(async app => {
            let date = app.start.getTime();
            let hour = 1000 * 60 * 60;
            let gap = date-Date.now();
            if (gap <= hour) {
                if(!app.notified){
                await Appo.findByIdAndUpdate(app.id,{notified: true});
                transport.sendMail({
                    from: "Wictor Rafael <wictor@teste.com>",
                    to: app.email,
                    subject: "Sua consulta acontecerá em breve!",
                    text: "Olá, tudo bem? Passando para lembrar que sua consulta será daqui a 1 hora."
                   }).then(() => {
                        console.log("email enviado com sucesso!")
                   }).catch(err => {
                        console.log(err);
                   })
                }
            }
        })
    }

}

module.exports = new AppointmentService();
