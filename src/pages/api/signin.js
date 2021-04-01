const db = require("../../db");
const errors = require("../../ui/errors");
import { formatError } from "../../ui/utils";

export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    const params = JSON.parse(req.body);
    console.log(params);
    db.signIn(params)
      .then((data) => {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "max-age=180000"); //(?)
        if (data === "INVALID") {
          res.status(200).end(formatError(errors.INVALID_LOGIN));
        } else res.status(200).end(JSON.stringify(data));
        resolve();
      })
      .catch((error) => {
        res.json(error);
        res.status(405).end();
        resolve();
      });
  });
}
