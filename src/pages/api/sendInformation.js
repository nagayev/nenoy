const db = require('../../db');
export default (req, res) => {
    const content = JSON.parse(req.body);
    console.log(content);
    res.statusCode = 200;
    db.append2DB(content);
    //res.setHeader('Content-Type', 'application/json')
    //res.end(JSON.stringify({ name: 'John' }))
    res.end('OK');
}  