const db = require("../usersdb");
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email_user,
    pass: process.env.email_pass,
  },
});
const regMailTemplate = {
  subject: "Регистрация на Неной",
  from: '"Nenoy" <sidorovmarat1995@gmail.com>',
  text: "Вы успешно зарегистрировались на сайте nenoy.ru",
};
const recoveryMailTemplate = {
  subject: "Восстановление пароля на Неной",
  from: '"Nenoy" <sidorovmarat1995@gmail.com>',
  text: "Для восстановления пароля перейдите по ссылке",
};
async function _sendMail(
  email: string,
  mail: typeof regMailTemplate,
): Promise<void> {
  try {
    await transporter.sendMail({
      from: mail.from,
      to: email,
      subject: mail.subject,
      text: mail.text,
    });
  } catch (e) {
    console.error(`Mail to ${email} isn't delivered`);
  }
}
function sendAfterRegistrationMail(email: string): Promise<void> {
  return _sendMail(email, regMailTemplate);
}
function sendRecoveryMail(email: string): Promise<void> {
  const copy = Object.assign({}, recoveryMailTemplate);
  const token = db.getToken(email); //TODO: check this!
  copy.text += ` https://nenoy.ru/changePassword?tonen=${token}`;
  return _sendMail(email, copy);
}
export { sendAfterRegistrationMail, sendRecoveryMail };
