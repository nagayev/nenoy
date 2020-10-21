const db = require('../../usersdb');
import {formatError, formatOk} from "../../ui/utils";

export default (req, res) => {
    const content = JSON.parse(req.body);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    //TODO: check if user exists
    const check = ans => {
        if(ans){
            //login is unavailable
            res.end(formatError(0))
        }
        else{
            db.appendUser(content.login,content.password);
            res.end(formatOk());
        }
    }
    db.isLoginExists(content.login).then(ans=>check(ans));
}