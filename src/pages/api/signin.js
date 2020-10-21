const db = require('../../usersdb');
import {formatOk} from "../../ui/utils";

export default async function(req, res) {
  //NOTE: don't delete new Promise(...)
  return new Promise((resolve, reject) => {
    const {login,password} = JSON.parse(req.body);
    db.getToken(login,password)
      .then(data => {
        res.setHeader('Content-Type', 'application/json');
        if(data==='0'){
          res.status(200).end(formatOk());
        } 
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
  