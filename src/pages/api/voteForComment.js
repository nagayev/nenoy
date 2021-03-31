const db = require("../../db");
const errors = require("../../ui/errors");
import { formatError, formatOk } from "../../ui/utils";

export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    const data = JSON.parse(req.body);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "max-age=180000"); //(?)
    db.voteForComment(data)
      .then((data) => {
        if (data === "INVALID") {
          res.status(200).end(formatError(errors.VOTE));
        } else res.status(200).end(formatOk());
        resolve();
      })
      .catch((error) => {
        res.json(error);
        res.status(405).end();
        resolve();
      });
  });
}
