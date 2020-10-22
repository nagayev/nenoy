const Sequelize = require('sequelize');
const { QueryTypes } = Sequelize;
//import MD5 from './ui/md5';
const MD5 = require('./ui/md5');
const config =  {
    username: null,
    password: null, 
    database: 'users_db',
    host: 'localhost', 
    dialect: 'sqlite', 
    dialectOptions: {
      multipleStatements: true
    },
    logging: false,
    storage: './users.db', 
    operatorsAliases: Sequelize.Op 
}  
let sequelize = new Sequelize(config); 
async function appendUser(login,password){
  //console.warn(login,password);
  let user = sequelize.define('users',{
    id: {
      //allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.DataTypes.INTEGER
    }, 
    login:{
      type: Sequelize.DataTypes.STRING
    },
    password:{
      type: Sequelize.DataTypes.STRING
    },
    rank:{
      type:Sequelize.DataTypes.INTEGER
    },
    place:{
      type:Sequelize.DataTypes.STRING
    }
  },{
    timestamps: false //NOTE:timestampts????
  });
  await sequelize.sync();
  let data = {
    login,
    password,
    rank:0,
    place:'не указано'
  }
  await sequelize.models.users.create(data);
}
async function getToken(login,password){
  let password_from_db = await sequelize.query(`SELECT password from users WHERE login='${login}';`,{ type: QueryTypes.SELECT });
  if(password_from_db[0].password!==password) return '0';
  return MD5(`${login}_${password}`);
}
async function isLoginExists(login){
  let ok;
  ok = await sequelize.query(`SELECT * from users WHERE login='${login}';`,
  { type: QueryTypes.SELECT });
  console.log(ok);
  if(ok.length===0) return false;
  return true;
}
async function getUserInfo(id){
  //rank and place
  let response;
  response = await sequelize.query(`SELECT rank,place from users WHERE id='${id}';`,
  { type: QueryTypes.SELECT });
  return response;
}
module.exports={appendUser,getToken,isLoginExists,getUserInfo}

//export {appendUser,getToken};