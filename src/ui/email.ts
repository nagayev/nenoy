const db = require("../usersdb");
const nodemailer = require("nodemailer");
const auth = {
  user: process.env.email_user,
  pass: process.env.email_pass,
};
let transporter = nodemailer.createTransport({
  service: "yandex",
  auth 
});
const from = '"Nenoy" <nagaevmt@yandex.ru>';
const regMailTemplate = {
  subject: "Регистрация на Неной",
  from,
  text: "Вы успешно зарегистрировались на сайте nenoy.ru",
};
const recoveryMailTemplate = {
  subject: "Восстановление пароля на Неной",
  from,
  text: "Для восстановления пароля перейдите по ссылке",
};
const changePasswordTemplate = {
  subject: "Изменение пароля на Неной",
  from,
  text:
    "Вы успешно изменили пароль от своей учетной записи\n \
  Если это были не Вы - напишите нам в поддержку vp@nenoy.ru ",
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
    console.error(`Mail to ${email} isn't delivered, error: ${e}`);
  }
}

function sendAfterRegistrationMail(email: string): Promise<void> {
  return _sendMail(email, regMailTemplate);
}

function sendRecoveryMail(email: string): void {
  const copy = Object.assign({}, recoveryMailTemplate);
  db.getToken(email).then((token) => {
    copy.text += ` https://nenoy.ru/changePassword?hash=${token}`;
    _sendMail(email, copy);
  });
}

function sendAfterPasswordChange(email: string): void {
  _sendMail(email, changePasswordTemplate);
}

export { sendAfterRegistrationMail, sendRecoveryMail, sendAfterPasswordChange };
