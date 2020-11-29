const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email_user,
    pass: process.env.email_pass,
  },
});
async function sendMail(email) {
  console.log("Email", email);
  transporter
    .sendMail({
      from: '"Nenoy" <sidorovmarat1995@example.com>',
      to: email,
      subject: "Регистрация на Nenoy",
      text: "Вы успешно зарегистрировались на сайте nenoy.ru",
    })
    .then(() => {
      console.log(`Письмо отправлено по адресу ${email}`);
    });
}
module.exports = sendMail;
