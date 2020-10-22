const db = require('../../usersdb');
export default async function(req, res) {
  //NOTE: don't delete new Promise(...)
  const id = JSON.parse(req.body).id;
  return new Promise((resolve, reject) => {
    db.getUserInfo(id)
      .then(data => {
        console.log('server2',JSON.stringify(data));
        //res.statusCode = 200
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'max-age=180000'); //(?)
        res.status(200).end(JSON.stringify(data))
        resolve();
      })
      .catch(error => {
        res.json(error);
        res.status(405).end();
        resolve()
      });
  });
};
  