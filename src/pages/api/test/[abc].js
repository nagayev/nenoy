const fs = require("fs");

//https://api-maps.yandex.ru/2.1/?
//onload=__yandex-maps-api-onload__$$1eosdna8i&onerror=__yandex-maps-api-onerror__$$1eosdna8i&lang=ru_RU&load=&ns=&mode=debug

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
}
export default async function (req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    console.log(req.query.abc);
    const start = req.query.abc.indexOf("api-onload") + 14;
    const end = req.query.abc.indexOf("&");
    const hash = req.query.abc.slice(start, end);
    console.log("hash: ", hash);
    fs.promises.readFile("test.js").then((data) => {
      let d = data.toString();
      d = replaceAll(d, "1eosav2ee", hash); //Now we have correct script (?)
      res.status(200).end(d);
      resolve();
    });
  });
}
