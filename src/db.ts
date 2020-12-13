export {};
const { MongoClient, ObjectId } = require("mongodb");
const { deleteKeys } = require("./ui/utils");
//NOTE: uri and client is global in order to backward compatibility
const uri = process.env["mongodb_url"];
const opts = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};
const client = new MongoClient(uri, opts);
const DBNAME = "posts";
const firstCollection = "objects";
const secondCollection = "posts";
const commentariesCollection = "commentaries";

type ObjectType = {
  name: string;
  coords: number[];
  checked?: boolean;
  type: number;
};
type PostType = {
  parent_object_id: string;
  header: string;
  content: string;
  type: number;
  createdAt: number;
  updatedAt: number;
  checked?: boolean;
};
globalThis.connected = false;
async function maybe_connect() {
  console.log("maybe_connect");
  if (!globalThis.connected) {
    console.log("real connect");
    await client.connect();
    globalThis.connected = true;
  }
}
async function appendObject(arg: ObjectType) {
  await maybe_connect();
  arg.checked = true; //TODO:
  const result = await client
    .db(DBNAME)
    .collection(firstCollection)
    .insertOne(arg);
  console.log(
    `New listing created with the following id: ${result.insertedId}`,
  );
  return result.insertedId;
}
async function appendPost(arg: PostType) {
  await maybe_connect();
  arg.checked = true; //TODO: false in production
  const result = await client
    .db(DBNAME)
    .collection(secondCollection)
    .insertOne(arg);
  console.log(
    `New listing created with the following id: ${result.insertedId}`,
  );
}
async function append2DB(arg): Promise<void> {
  await maybe_connect();
  const { type, name, coords, content, header, createdAt, updatedAt } = arg;
  const parent_object_id = ObjectId(await appendObject({ type, coords, name }));
  appendPost({ content, header, type, createdAt, updatedAt, parent_object_id });
}
async function getComments(id: string) {
  await maybe_connect();
  let commentaries: any[] = [];
  const addToCommentaries = (commentary) => commentaries.push(commentary);
  await client
    .db(DBNAME)
    .collection(commentariesCollection)
    .find({ post_id: ObjectId(id) })
    .forEach(addToCommentaries);
  return commentaries;
}
//FIXME: (???)
async function getPosts(type: number) {
  await maybe_connect();
  const posts: any[] = [];
  const addToPosts = (post) => posts.push(post);
  await client
    .db(DBNAME)
    .collection(secondCollection)
    .find({ checked: true, type: type })
    .forEach(addToPosts);
  return posts;
}
//NOTE: inner function, we don't export it!
async function getObjectIdByCoords(coords: number[]): Promise<string> {
  //await client.connect();
  await maybe_connect();
  const id = await client
    .db(DBNAME)
    .collection(firstCollection)
    .findOne({ coords: coords });
  return id._id;
}
async function getPostsByCoords(coords: number[]): Promise<any> {
  await maybe_connect();
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
  //await client.connect();
  await maybe_connect();
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
    //await client.connect();
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
    getComments,
    getPlacemarks,
    getPosts,
    getPostsByCoords,
  };
}
//export {append2DB,appendObject,appendPost};
