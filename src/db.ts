import { deleteKeys } from "./ui/utils";

export {};
const { MongoClient, ObjectId } = require("mongodb");
//NOTE: uri and client is global in order to backward compatibility
const uri = process.env["mongodb_url"];
const opts = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  //TODO: experimental opts below
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
//FIXME: (???)
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
//NOTE: inner function, we don't export it!
async function getObjectIdByCoords(coords: number[]): Promise<string> {
  await client.connect();
  const id = await client
    .db(DBNAME)
    .collection(firstCollection)
    .findOne({ coords: coords });
  return id._id;
}
async function getPostsByCoords(coords: number[]): Promise<any> {
  const posts: any[] = [];
  function addPosts(post) {
    deleteKeys(post, ["_id", "parent_object_id", "type", "checked"]); //remove unused in client information
    posts.push(post);
  }
  const id = await getObjectIdByCoords(coords);
  await client
    .db(DBNAME)
    .collection(secondCollection)
    .find({ parent_object_id: ObjectId(id) })
    .forEach(addPosts);
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
    getPostsByCoords([55.34127762643805, 37.61828554687499]);
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
    getPostsByCoords,
  };
}
//export {append2DB,appendObject,appendPost};
