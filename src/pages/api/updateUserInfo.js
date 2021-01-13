const db = require("../../usersdb");
export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    const body = JSON.parse(req.body);
    db.updateUserInfo(body)
      .then((data) => {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "max-age=180000"); //(?)
        res.status(200).end(JSON.stringify(data));
        resolve();
      })
      .catch((error) => {
        console.error("error", error);
        res.json(error);
        res.status(405).end();
        resolve();
      });
  });
}
