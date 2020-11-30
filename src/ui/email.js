const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email_user,
    pass: process.env.email_pass,
  },
});
async function sendMail(email) {
  await transporter.sendMail({
    from: '"Nenoy" <sidorovmarat1995@example.com>',
    to: email,
    subject: "Nenoy registration",
    text: "Вы успешно зарегистрировались на сайте nenoy.ru",
  });
}
module.exports = sendMail;
