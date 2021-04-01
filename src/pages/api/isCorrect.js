const db = require("../../db");
export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  const id = JSON.parse(req.body).id;
  return new Promise((resolve, reject) => {
    const obj = JSON.parse(req.body); //{token:'523fjfmfvlmlfv'}
    const key = Object.keys(obj)[0]; //token
    const expected_value = obj[key]; //'523kclmcldls'
    db.isSomethingCorrect(key, expected_value)
      .then((data) => {
        //data is boolean
        //console.log("data ", data);
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
