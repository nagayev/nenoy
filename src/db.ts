export {};
const { MongoClient } = require("mongodb");
//NOTE: uri and client is global in order to backward compatibility
const uri = process.env["mongodb_url"];
const opts = {
  useUnifiedTopology: true, // установка опций
  useNewUrlParser: true,
};
const client = new MongoClient(uri, opts);
const DBNAME = "posts";
const firstCollection = "objects";
const secondCollection = "posts";

type ObjectType = {
  name: string;
  coords: number[];
  type: number;
  //posts:any,
  checked: boolean;
};
type PostType = {
  header: string;
  content: string;
  type: number;
  createdAt: number;
  updatedAt: number;
  checked: boolean;
};
async function appendObject(arg) {
  const result = await client
    .db(DBNAME)
    .collection(firstCollection)
    .insertOne(arg);
  console.log(
    `New listing created with the following id: ${result.insertedId}`,
  );
}
async function appendPost(arg: PostType) {
  const result = await client
    .db(DBNAME)
    .collection(secondCollection)
    .insertOne(arg);
  console.log(
    `New listing created with the following id: ${result.insertedId}`,
  );
}
async function append2DB(arg) {
  //FIXME: posts not used!
  await client.connect();
  const {
    type,
    name,
    posts,
    coords,
    content,
    header,
    createdAt,
    updatedAt,
  } = arg;
  appendObject({ type, coords, name });
  appendPost({ content, header, type, createdAt, updatedAt, checked: true }); //FIXME: temporally true
}
//FIXME:
async function getPosts(type: number) {
  await client.connect();
  const posts: any[] = [];
  const addToPosts = (a) => posts.push(a);
  await client
    .db(DBNAME)
    .collection(secondCollection)
    .find({ checked: true, type: type })
    .forEach(addToPosts);
  return posts;
}
async function getPlacemarks() {
  await client.connect();
  const coords: any[] = [];
  const addToCoords = (a) => coords.push(a.coords);
  await client
    .db(DBNAME)
    .collection(firstCollection)
    .find({}, { coords: [] })
    .forEach(addToCoords);

  //`SELECT coords from objects WHERE checked=1;`,

  //console.log(objects);
  return coords;
}
async function main() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    await getPosts(0).then((data) => console.log(data));
    //appendObject({ type: 2, coords: [54.1, 33.2], name: "defg" });
    //select name, content from knowledgebase where applicationId='2955f3e174dce55190a87ed0e133adwdeb92';
    //db.knowledgebase.find({ "checked": true}, { "coords": 1});
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
if (require.main === module) {
  //directly from bash
  //NOTE: works as INSERT
  //appendObject({type:1,coords:[22.1,23.2],name:'abc'});
  //appendPost({header:'Post header',content:'Content'})
  main().catch(console.error);
} else {
  module.exports = {
    append2DB,
    appendObject,
    appendPost,
    getPlacemarks,
    getPosts,
  };
}
//export {append2DB,appendObject,appendPost};
