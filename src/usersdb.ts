export {};
const { MongoClient } = require("mongodb");
//NOTE: uri and client is global in order to backward compibility
const uri = process.env["mongodb_url"];
const client = new MongoClient(uri);
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
async function getToken(login: string, password: string): Promise<MD5Type> {
  //`SELECT password from users WHERE login='${login}';
  await client.connect();
  let password_from_db = await client
    .db(DBNAME)
    .collection(firstCollection)
    .findOne({ login: login });
  if (password_from_db[0].password !== password) return "0";
  return MD5(`${login}_${password}`);
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
async function getUserInfo(id): Promise<any[]> {
  //rank and place
  // `SELECT rank,place from users WHERE id='${id}';`
  await client.connect();
  const userInfo: any[] = [];
  const addToUserInfo = (a) => userInfo.push([a.rank, a.place]);
  let response;
  response = await client
    .db(DBNAME)
    .collection(firstCollection)
    .find({}, { rank: 1, id: 0 })
    .forEach(addToUserInfo);
  return userInfo;
}
async function main() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    //appendUser('sidorovmarat1995@gmail.com','y5=#2248');
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
if (require.main === module) {
  //directly from bash
  main().catch(console.error);
} else module.exports = { appendUser, getToken, isLoginExists, getUserInfo };

//export {appendUser,getToken};
