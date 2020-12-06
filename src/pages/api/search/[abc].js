const NodeGeocoder = require("node-geocoder");
const options = {
  provider: "openstreetmap",
  formatter: null, // 'gpx', 'string', ...
};
const geocoder = NodeGeocoder(options);
export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    function callback(data) {
      const a = 43.1056;
      const b = 131.874;
      console.log("lalalal");
      res.status(200).end(`placemarkCoords=[${a},${b}];loaded=true;`);
    }
    const object = req.query.text;
    geocoder.geocode(object).then((data) => callback(data));
    resolve();
  });
}
