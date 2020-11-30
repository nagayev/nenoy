export {};
const { MongoClient, ObjectId } = require("mongodb");
//NOTE: uri and client is global in order to backward compibility
const uri = process.env["mongodb_url"];
const opts = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};
const client = new MongoClient(uri, opts);
const DBNAME = "users";
const firstCollection = "users";
type MD5Type = string;
const MD5 = require("./ui/md5");
async function appendUser(login, password, name): Promise<void> {
  //console.warn(login,password);
  await client.connect();
  let data = {
    login,
    password,
    name,
    rank: 0,
    place: "не указано",
  };
  const result = await client
    .db(DBNAME)
    .collection(firstCollection)
    .insertOne(data);
  console.log(
    `New listing created with the following id: ${result.insertedId}`,
  );
}
type sigInType = {
  token: MD5Type;
  id: string;
};
async function signIn(
  login: string,
  password: string,
): Promise<sigInType | string> {
  //`SELECT password from users WHERE login='${login}';
  const data = { token: "", id: "" };
  await client.connect();
  let data_from_db = await client
    .db(DBNAME)
    .collection(firstCollection)
    .findOne({ login: login });
  if (data_from_db === null) return "INVALID"; //invalid login
  if (data_from_db.password !== password) return "INVALID"; //correct login but incorrect password
  data.token = MD5(`${login}_${password}`);
  data.id = data_from_db._id;
  return data;
}
async function isLoginExists(login: string): Promise<boolean> {
  await client.connect();
  let ok;
  //`SELECT * from users WHERE login='${login}';`
  ok = await client
    .db(DBNAME)
    .collection(firstCollection)
    .findOne({ login: login });
  //console.log(ok);
  return ok !== null;
}
async function getUserInfo(id: string): Promise<any> {
  //rank and place
  // `SELECT rank,place from users WHERE id='${id}';`
  //select name, content from knowledgebase where applicationId='1';
  //db.knowledgebase.find({ "applicationId": "1"}, { "name": 1,    "content": 1});
  await client.connect();
  let result = await client
    .db(DBNAME)
    .collection(firstCollection)
    .find({ _id: ObjectId(id) });
  result.forEach((smt) => {
    globalThis.UserInfo = smt;
  });
  return globalThis.UserInfo;
}
async function main() {
  try {
    // Connect to the MongoDB cluster
    //await client.connect();
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
if (require.main === module) {
  //directly from bash
  main().catch(console.error);
} else module.exports = { appendUser, signIn, isLoginExists, getUserInfo };

//export {appendUser,getToken};
