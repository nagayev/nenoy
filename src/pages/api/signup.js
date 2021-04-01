const db = require("../../newdb");
import { sendAfterRegistrationMail } from "../../ui/email";
import errors from "../../ui/errors";
import { formatError, formatOk } from "../../ui/utils";
export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    const content = JSON.parse(req.body);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    const check = (ans) => {
      if (ans) {
        //login is unavailable
        res.end(formatError(errors.BUSY_LOGIN));
        resolve();
      } else {
        db.signUp(content);
        sendAfterRegistrationMail(content.login);
        res.end(formatOk());
        resolve();
      }
    };
    db.isLoginExists(content.login).then((ans) => check(ans));
  });
}
