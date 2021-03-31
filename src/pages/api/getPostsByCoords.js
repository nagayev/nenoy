const db = require("../../newdb");
export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    const coords = JSON.parse(req.body); //[55.34127762643805, 37.61828554687499];
    console.log(coords);
    db.getPostsByCoords(coords)
      .then((data) => {
        //console.log("data", data);
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
