const fs = require('fs');
export default async function(req, res) {
    return new Promise((resolve, reject) => {
        fs.promises.readFile('public/placemarks.json')
        .then(response => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'max-age=180000');
          res.end(JSON.stringify(response.toString()))
          resolve();
        })
        .catch(error => {
          res.json(error);
          res.status(405).end();
          resolve()
        });
    });
};
  