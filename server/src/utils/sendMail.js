const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "server36.web-hosting.com",
            port: 465,
            secure: true,
            auth: {
              user: "no-reply@carelog.gavrielov.dev",
              pass: "CareLogEmail", // generated ethereal password
            },
          });

          await transporter.sendMail({
            from: '"CareLog (No-Reply)" <no-reply@carelog.gavrielov.dev>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            //html: "<b>Hello world?</b>", // html body
          });
    } catch(e) {
        console.log(e, "message not sent.");
    }
}

module.exports = sendEmail;