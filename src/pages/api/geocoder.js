const NodeGeocoder = require("node-geocoder");
const options = {
  provider: "openstreetmap",
  formatter: null,
};
const geocoder = NodeGeocoder(options);
export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    console.log(req.body);
    const place = JSON.parse(req.body).place;
    geocoder.geocode(place).then((data) => {
      data = JSON.stringify(data);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "max-age=180000"); //(?)
      res.status(200).end(data);
      resolve();
    });
  });
}
