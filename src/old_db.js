/*
https://allwebstuff.info/%D0%BA%D0%B0%D0%BA-%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D1%8C-orm-sequelize
*/
/*
interface createDBInterface {
  type:any
  userPlacemark:any[]
  name:string
  header:string
  content:string
} */
const Sequelize = require('sequelize'); //Подключаем библиотеку
const { QueryTypes } = Sequelize;
const { exec } = require('child_process');
const [RED,NORMAL] = ['\x1B[31m','33[0m']

const config =  {
  username: null,
  password: null, // Для sqlite пароль не обязателен
  database: 'test_db', // Имя базы данных
  host: 'localhost', // Адрес субд, для sqlite всегда локалхост
  dialect: 'sqlite', // Говорим, какую СУБД будем юзать
  dialectOptions: {
    multipleStatements: true
  },
  logging: false,//console.log, // function or false NOTE: false in future
  storage: './test_db.db', // Путь к файлу БД
  operatorsAliases: Sequelize.Op // Передаём алиасы параметров (дальше покажу нафига)
}

let sequelize = new Sequelize(config); // Создаём подключение
/*
 DB:
 TABLE Objects
 -----------------------------
 |id|coords | posts|type    |name         |
 |10|[0.1,0]|[2,4,]|HOSPITAL|Горбольница№1|
 ------------------------------
 //NOTE: id объекта в таблице посты нет, они идут всей кучей (т.е посты 2,3,4 и т.д)
 TABLE Posts
  |post_id|header|body
  |1      |abcd! |abcd fkfkldfjkfkf
  |2      |12fj! |dfkl le;1wd;wld;wd;
 */
async function createObject(arg){
  const {type,userPlacemark,name} = arg;
  console.log('Deleting previous DB is OFF');
  /*
  console.log(`${RED}Deleting previous DB...\0${NORMAL}\t\t`)
  exec('rm -rf /home/marat/website/test_db.db') */
  console.log('NAME ',name);
    let objects = sequelize.define('objects', {
        id: {
          //allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER
        }, 
        name: {
          type: Sequelize.DataTypes.STRING,
          //allowNull: false
        },
        coords:{
            type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.FLOAT)
        },
        type:{
            type: Sequelize.DataTypes.INTEGER
        },
        posts:{
          type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER)
        }
      }, {
        timestamps: false //NOTE:нужны ли таймстемпы????
    }); 
    await sequelize.sync();
    let firstObject = {
        //id:1,
        name: name,
        type: type,
        posts:[1,2,3],
        coords:userPlacemark
    }
    let firstDBRecord = await sequelize.models.objects.create(firstObject);
}
async function createPost(arg){
  const {header,content} = arg;
  let posts = sequelize.define('posts',{
    header:{
      type:Sequelize.DataTypes.STRING
    },
    body:{
      type:Sequelize.DataTypes.STRING
    },
    post_id:{
      type:Sequelize.DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    }
  },{
    timestamps: true // Колонки createdAt и updatedAt будут созданы автоматически
  })
  await sequelize.sync();
  let secondObject = {
    //post_id:1,
    body:content||'Текст новости',
    header:header||'Заголовок новости'
  }
  let secondDBRecord = await sequelize.models.objects.create(secondObject); 
}
async function readInformation(table,param,val){
    //TODO: add reading information
    let objects;
    try{
      objects = await sequelize.query(`SELECT * from ${table} where ${param}=${val};`,{ type: QueryTypes.SELECT });
    }
    catch(e){
      return 'error'
    }
    return objects;
}
function createDB(arg){
  const {type,userPlacemark,name,header,content} = arg;
  createObject({type,userPlacemark,name});
  createPost({header,content});
}
createDB({
  type:1,
  userPlacemark:[21.2,22.1],
  name:'a',
  header:'b',
  content:'c'
});
/*
const mode = 2;
if(mode===1) createDB();
//NOTE: deprecated
if(mode===2) readInformation(); */
//export {readInformation,createDB,createPost,createObject};