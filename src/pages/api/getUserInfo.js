const db = require("../../db");
export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    const id = JSON.parse(req.body).id;
    db.getUserInfo(id)
      .then((data) => {
        //console.log("debug data", data);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "max-age=180000"); //(?)
        res.status(200).end(JSON.stringify(data));
        resolve();
      })
      .catch((error) => {
        res.json(error);
        res.status(405).end();
        resolve();
      });
  });
}
