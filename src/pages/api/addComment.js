const db = require("../../db");
import errors from "../../ui/errors";
import { formatError, formatOk } from "../../ui/utils";
export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    const content = JSON.parse(req.body);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    const check = (ans) => {
      if (ans === "INVALID") {
        //login is unavailable
        res.end(formatError(errors.INVALID_TOKEN));
        resolve();
      } else {
        res.end(formatOk());
        resolve();
      }
    };
    db.addComment(content).then((ans) => check(ans));
  });
}
