const db = require("../../newdb");
const errors = require("../../ui/errors");
import { sendRecoveryMail } from "../../ui/email";
import { formatError, formatOk } from "../../ui/utils";

export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    const { login } = JSON.parse(req.body);
    console.log(login);
    db.isLoginExists(login)
      .then((data) => {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "max-age=180000"); //(?)
        console.log(data);
        if (data) {
          sendRecoveryMail(login);
          res.status(200).end(formatOk());
        } else res.status(200).end(formatError(errors.INVALID_LOGIN));
        resolve();
      })
      .catch((error) => {
        res.json(error);
        res.status(405).end();
        resolve();
      });
  });
}
