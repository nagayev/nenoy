export {};
const { MongoClient, ObjectId } = require("mongodb");
const { deleteKeys } = require("./ui/utils");
//import { getIdByToken } from "./usersdb";
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
  arg.checked = false;
  arg.parent_object_id = ObjectId(arg.parent_object_id);
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
  const parent_object_id = await appendObject({ type, coords, name });
  appendPost({ content, header, type, createdAt, updatedAt, parent_object_id });
}
//NOTE: don't move this to usersdb yet (connection error)
//TODO: move this function to usersdb.ts
async function _getIdByToken(token: string): Promise<string> {
  await maybe_connect();
  let result;
  result = await client
    .db("users")
    .collection("users")
    .findOne({ token: token });
  if (!result) return "";
  return result._id;
}
async function addComment(arg): Promise<void | string> {
  await maybe_connect();
  //TODO: check token, if incorrect return invalid
  arg.post_id = ObjectId(arg.post_id);
  arg.user_id = ObjectId(await _getIdByToken(arg.token));
  arg.rank = 0;
  arg.checked = false;
  delete arg.token;
  const result = await client
    .db(DBNAME)
    .collection(commentariesCollection)
    .insertOne(arg);
  console.log(
    `New listing created with the following id: ${result.insertedId}`,
  );
}
async function getComments(id: string) {
  await maybe_connect();
  let commentaries: any[] = [];
  const addToCommentaries = (commentary) => commentaries.push(commentary);
  await client
    .db(DBNAME)
    .collection(commentariesCollection)
    .find({ post_id: ObjectId(id), checked: true })
    .forEach(addToCommentaries);
  return commentaries;
}

async function getPosts(type: number, page: number) {
  const POSTS_PER_PAGE = 3;
  await maybe_connect();
  const posts: any[] = [];
  const addToPosts = (post) => posts.push(post);
  await client
    .db(DBNAME)
    .collection(secondCollection)
    .find({ checked: true, type: type })
    .skip(POSTS_PER_PAGE * (page - 1))
    .limit(POSTS_PER_PAGE)
    .forEach(addToPosts);
  return posts;
}

async function _getObjectIdByCoords(coords: number[]): Promise<string> {
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
    deleteKeys(post, ["checked"]); //remove unused in client information
    posts.push(post);
  }
  const id = await _getObjectIdByCoords(coords);
  await client
    .db(DBNAME)
    .collection(secondCollection)
    .find({ parent_object_id: ObjectId(id)})
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
async function voteForComment(
  token: string,
  commentId: string,
  vote:number
): Promise<void | string> {
  await maybe_connect();
  let comment = await client
    .db(DBNAME)
    .collection("commentaries")
    .findOne({ _id: ObjectId(commentId) });
  console.log(comment,vote)
  if (!comment || !(vote==-1 || vote==1) ) return "INVALID";
  await client
    .db(DBNAME)
    .collection(commentariesCollection)
    .updateOne(
      { _id: ObjectId(commentId) },
      { $set: { rank:comment.rank+vote } },
    );
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
    addComment,
    append2DB,
    appendObject,
    appendPost,
    getComments,
    getPlacemarks,
    getPosts,
    getPostsByCoords,
    voteForComment
  };
}
//export {append2DB,appendObject,appendPost};
