const db = require("../../newdb");
import { formatOk } from "../../ui/utils";
export default (req, res) => {
  const content = JSON.parse(req.body);
  res.statusCode = 200;
  //NOTE: есть объект => просто добавляем пост к существующему объекту
  if (content.parent_object_id) {
    db.appendPost(content);
  } else {
    db.append2DB(content);
  }

  res.setHeader("Content-Type", "application/json");
  res.end(formatOk());
};
