const fs = require('fs');
export default async function(req, res) {
  //FIXME: read DB insted of JSON!
  return (
    fs.promises.readFile('public/placemarks.json')
      .then(response => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'max-age=180000'); //(?)
        res.end(JSON.stringify(response.toString()))
      })
      .catch(err=>{
        res.json(err);
        res.status(405).end();
      })
  );
}
  