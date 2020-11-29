const fs = require("fs");
const child_process = require("child_process");
//const os = require("os");
function installDeps() {
  child_process.exec("npm i");
}
function createEnvLocal() {
  fs.promises.readFile("envlocal.template").then((data) => {
    fs.promises.writeFile("env.local", data);
  });
}
function openEditor(path) {
  //const type = os.type();
  console.log("Please configure your .env.local file");
}
console.log("Hello");
console.log("You ran quickstart");
console.log("Installing deps...");
installDeps();
console.log("Deps was succesfully installed");
console.log("Creating .env.local for you...");
createEnvLocal();
console.log("Now you should type url to your database in .env.local");
openEditor(".env.local");
console.log("Finish!");
//console.log("Now you can type npm run dev and then go to localhost:3000");
