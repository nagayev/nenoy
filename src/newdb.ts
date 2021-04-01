const { MongoClient, ObjectId } = require("mongodb");
const { deleteKeys } = require("./ui/utils");
const MD5 = require("./ui/md5");
const uri = process.env["mongodb_url"];
const opts = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};
const client = new MongoClient(uri, opts);
//TODO: move types to file .d.ts
//FIXME: we should use INVALID ONLY in this file and return error's code to client
type MD5Type = string;
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
type sigInType = {
    token: MD5Type;
    id: string;
};
async function connectOnce() {
    if (!globalThis.connected) {
      await client.connect();
      globalThis.connected = true;
    }
}
globalThis.connected = false;
const INVALID = "INVALID";
const usersDB = "users";
const usersCollection = "users";
const postsDB = "posts";
const objectsCollection = "objects";
const postsCollection = "posts";
const commentariesCollection = "commentaries";

type UserInfo = {
  login:string,
  password:string,
  name:string,
  token:MD5Type,
  rank:number,
  vk:string,
  type:string,
  registration:number
}

async function signUp(params:UserInfo): Promise<void> {
    await connectOnce();
    const data = Object.assign({},params,{
      token: MD5(`${params.login}_${params.password}`),
      rank: 0,
      place: "не указано",
      vk: "не указан",
      type: "user", //TODO: in future we will have admin
      registration: +new Date(),
    });
    const result = await client
      .db(usersDB)
      .collection(usersCollection)
      .insertOne(data);
    console.log(`Append user with id: ${result.insertedId}`);
}

async function changePassword(params:{
    token: string,
    new_password: string,
}): Promise<void | string> {
    await connectOnce();
    let user = await client
      .db(usersDB)
      .collection(usersCollection)
      .findOne({ token: {params} });
    if (!user) return INVALID;
    const login = user.login;
    const new_token = MD5(`${login}_${params.new_password}`);
    await client
      .db(usersDB)
      .collection(usersCollection)
      .updateOne(
        { token:params.token },
        { $set: { password: params.new_password, token: new_token } },
      );
}

async function updateUserInfo(userData: {
    token: string;
  }): Promise<void | string> {
    await connectOnce();
    let token = userData.token;
    delete userData.token; //it's typescript bug, we should update our Typescript to 4.0
    let user = await client
      .db(usersDB)
      .collection(usersCollection)
      .findOne({ token });
    if (!user) return INVALID;
    await client
      .db(usersDB)
      .collection(usersCollection)
      .updateOne({ token }, { $set: userData });
}

async function signIn(
    params:{login: string,
    password: string}
  ): Promise<sigInType | string> {
    //`SELECT password from users WHERE login='${login}';
    const data = { token: "", id: "" };
    await connectOnce();
    let data_from_db = await client
      .db(usersDB)
      .collection(usersCollection)
      .findOne({ login: {params} });
    if (data_from_db === null) return INVALID; //invalid login
    if (data_from_db.password !== params.password) return INVALID; //correct login but incorrect password
    data.token = data_from_db.token;
    data.id = data_from_db._id;
    return data;
}

async function isLoginExists(login: string): Promise<boolean> {
    await connectOnce();
    let ok;
    ok = await client
      .db(usersDB)
      .collection(usersCollection)
      .findOne({ login: login });
    return ok != null;
}
//TODO: rename this function ?
async function isSomethingCorrect(
    key: string,
    expected_value: string,
  ): Promise<boolean> {
    await connectOnce();
    let response;
    const searchParam = {};
    searchParam[key] = expected_value;
    response = await client
      .db(usersDB)
      .collection(usersCollection)
      .findOne(searchParam);
    if (!response) return false;
    return true;
}

async function getUserInfo(id: string): Promise<any[]> {
    await connectOnce();
    let result;
    result = await client
      .db(usersDB)
      .collection(usersCollection)
      .findOne({ _id: ObjectId(id) });
    if (result === null) return [];
    result.notesCount = await client
      .db(postsDB)
      .collection(postsCollection)
      .find({ user_id: ObjectId(id),checked:true }).count();
    result.commentariesCount=await client
    .db(postsDB)
    .collection(commentariesCollection)
    .find({ user_id: ObjectId(id),checked:true }).count();
    deleteKeys(result, ["_id", "login", "password", "token"]); //NOTE: exclude private info
    return result;
}

async function getToken(login: string): Promise<string> {
    await connectOnce();
    let result = await client
      .db(usersDB)
      .collection(usersCollection)
      .findOne({ login: login });
    return result.token;
}
//NOTE: db.ts below
async function appendObject(arg: ObjectType) {
    await connectOnce();
    arg.checked = true; //TODO:
    const result = await client
      .db(postsDB)
      .collection(objectsCollection)
      .insertOne(arg);
    console.log(
      `New listing created with the following id: ${result.insertedId}`,
    );
    return result.insertedId;
}

async function appendPost(arg: PostType) {
    await connectOnce();
    arg.checked = false;
    arg.parent_object_id = ObjectId(arg.parent_object_id);
    const result = await client
      .db(postsDB)
      .collection(postsCollection)
      .insertOne(arg);
    console.log(
      `New listing created with the following id: ${result.insertedId}`,
    );
}
async function append2DB(arg): Promise<void> {
    await connectOnce();
    const { type, name, coords, content, header, createdAt, updatedAt } = arg;
    const parent_object_id = await appendObject({ type, coords, name });
    appendPost({ content, header, type, createdAt, updatedAt, parent_object_id });
}
//NOTE: don't move this to usersdb yet (connection error)
//TODO: move this function to usersdb.ts
async function _getIdByToken(token: string): Promise<string> {
    await connectOnce();
    let result;
    result = await client
      .db("users")
      .collection("users")
      .findOne({ token: token });
    if (!result) return INVALID;
    return result._id;
}

async function addComment(arg): Promise<void | string> {
    await connectOnce();
    const id = await _getIdByToken(arg.token);
    if(id===INVALID) return INVALID;
    arg.post_id = ObjectId(arg.post_id);
    arg.user_id = ObjectId(id);
    arg.rank = 0;
    arg.checked = false;
    delete arg.token;
    const result = await client
      .db(postsDB)
      .collection(commentariesCollection)
      .insertOne(arg);
    console.log(
      `New listing created with the following id: ${result.insertedId}`,
    );
}

async function getComments(id: string) {
    await connectOnce();
    let commentaries: any[] = [];
    const addToCommentaries = (commentary) => commentaries.push(commentary);
    await client
      .db(postsDB)
      .collection(commentariesCollection)
      .find({ post_id: ObjectId(id), checked: true })
      .forEach(addToCommentaries);
    return commentaries;
}
async function getPosts(type: number, page: number) {
    const POSTS_PER_PAGE = 3;
    await connectOnce();
    const posts: any[] = [];
    const addToPosts = (post) => posts.push(post);
    await client
      .db(postsDB)
      .collection(postsCollection)
      .find({ checked: true, type: type })
      .skip(POSTS_PER_PAGE * (page - 1))
      .limit(POSTS_PER_PAGE)
      .forEach(addToPosts);
    return posts;
}
async function _getObjectIdByCoords(coords: number[]): Promise<string> {
    await connectOnce();
    const id = await client
      .db(postsDB)
      .collection(objectsCollection)
      .findOne({ coords: coords });
    return id._id;
}
async function getPostsByCoords(coords: number[]): Promise<any> {
    await connectOnce();
    const posts: any[] = [];
    function addPosts(post) {
      deleteKeys(post, ["checked"]); //remove unused in client information
      posts.push(post);
    }
    const id = await _getObjectIdByCoords(coords);
    await client
      .db(postsDB)
      .collection(postsCollection)
      .find({ parent_object_id: ObjectId(id),checked:true})
      .forEach(addPosts);
    return posts;
}
async function getPlacemarks() {
    //await client.connect();
    await connectOnce();
    const coords: any[] = [];
    const addToCoords = (a) => coords.push(a.coords);
    await client
      .db(postsDB)
      .collection(objectsCollection)
      .find({}, { coords: [] })
      .forEach(addToCoords);
  
    //`SELECT coords from objects WHERE checked=1;`,
  
    //console.log(objects);
    return coords;
}
async function voteForComment(
    data
  ): Promise<void | string> {
    await connectOnce();
    let comment = await client
      .db(postsDB)
      .collection("commentaries")
      .findOne({ _id: ObjectId(data.comment_id) });
    if (!comment || !(data.vote==-1 || data.vote==1) ) return "INVALID";
    //update ranking of commentary
    await client
      .db(postsDB)
      .collection(commentariesCollection)
      .updateOne(
        { _id: ObjectId(data.comment_id) },
        { $set: { rank:comment.rank+data.vote } },
      );
    let user = await client
      .db("users")
      .collection("users")
      .findOne({ _id: ObjectId(data.user_id) });
    if(!user) return INVALID;
    await client
        .db("users")
        .collection("users")
        .updateOne(
          { _id: ObjectId(data.user_id) },
          { $set: { rank:user.rank+data.vote } },
        );
}

export {
    //users functions
    signUp,
    changePassword,
    updateUserInfo,
    signIn,
    isLoginExists,
    isSomethingCorrect,
    getUserInfo,
    getToken,
    //db functions
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