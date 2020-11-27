const db = require("../../usersdb");
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
        res.end(formatError(0));
        resolve();
      } else {
        db.appendUser(content.login, content.password);
        res.end(formatOk());
        resolve();
      }
    };
    db.isLoginExists(content.login).then((ans) => check(ans));
  });
}
