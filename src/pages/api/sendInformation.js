const db = require('../../db');
export default (req, res) => {
    const content = JSON.parse(req.body);
    console.log(content);
    res.statusCode = 200;
    content.coords=[23.1,25.2];
    db.createDB(content);
    //res.setHeader('Content-Type', 'application/json')
    //res.end(JSON.stringify({ name: 'John' }))
    res.end('OK');
}  