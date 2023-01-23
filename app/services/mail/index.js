const nodemailer = require("nodemailer");
const { gmail, password } = require("../../config");
const Mustache = require("mustache");
const fs = require("fs");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: gmail,
        pass: password,
    },
});

const otpMail = async(email, data) => {
    try {
        let template = fs.readFileSync("app/views/email/otp.html", "utf8"); // nge-render file

        let message = {
            from: gmail,
            to: email,
            subject: "Otp for registrastion is:",
            html: Mustache.render(template, data), // library mustace untuk merender file html, data : data user yang daftar
        };

        return await transporter.sendMail(message);
    } catch (ex) {
        console.log(ex);
    }
};

const orderMail = async(email, data) => {
    try {
        let template = fs.readFileSync("app/view/email/invoice.html", "utf-8");

        let message = {
            from: gmail,
            to: email,
            subject: "Invoice payment online ticket:",
            html: Mustache.render(template, data),
        };

        return await transporter.sendMail(message);
    } catch (ex) {
        console.log(ex);
    }
};

module.exports = { otpMail, orderMail };