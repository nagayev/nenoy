const fs = require("fs");

export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    res.status(200).end("Bye");
    resolve();
  });
}
