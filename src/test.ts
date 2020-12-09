//export {};
const db = require("./db");
const usersdb = require("./usersdb");
async function mainDBTest() {
  try {
    const token = "";
    const new_password = "";
    usersdb.changePassword(token, new_password);
  } catch (e) {
    console.error(e);
  }
}
export { mainDBTest }; //same as export default mainDBTest
