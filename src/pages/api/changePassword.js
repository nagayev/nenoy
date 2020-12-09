const db = require("../../usersdb");
const errors = require("../../ui/errors");
import { sendRecoveryMail } from "../../ui/email";
import { formatError, formatOk } from "../../ui/utils";

export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    const { token, password } = JSON.parse(req.body);
    db.changePassword(token, password)
      .then((data) => {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "max-age=180000"); //(?)
        res.status(200).end(formatOk());
        resolve();
      })
      .catch((error) => {
        res.json(error);
        res.status(405).end();
        resolve();
      });
  });
}
