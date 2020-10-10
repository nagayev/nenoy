//export default 1;
/*
https://allwebstuff.info/%D0%BA%D0%B0%D0%BA-%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D1%8C-orm-sequelize
*/
const mode = 1;
const Sequelize = require('sequelize'); //Подключаем библиотеку
const { exec } = require('child_process');
const [RED,NORMAL] = ['\x1B[31m','33[0m']
console.log(`${RED}Deleting previous DB...\0${NORMAL}\t\t`)
exec('rm -rf /home/marat/website/test_db.db')
const config =  {
  username: null,
  password: null, // Для sqlite пароль не обязателен
  database: 'test_db', // Имя базы данных
  host: 'localhost', // Адрес субд, для sqlite всегда локалхост
  dialect: 'sqlite', // Говорим, какую СУБД будем юзать
  dialectOptions: {
    multipleStatements: true
  },
  logging: console.log, // function or false NOTE: false in future
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
async function createDB(){
    let objects = sequelize.define('objects', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER
        }, 
        name: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false
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
    let posts = sequelize.define('posts',{
      header:{
        type:Sequelize.DataTypes.STRING
      },
      body:{
        type:Sequelize.DataTypes.STRING
      },
      post_id:{
        type:Sequelize.DataTypes.INTEGER
      }
    },{
      timestamps: true // Колонки createdAt и updatedAt будут созданы автоматически
    })
    await sequelize.sync();
    let firstObject = {
        id:1,
        name: 'Самарская горбольница №1',
        type: 1,
        posts:[1,2,3],
        coords:[45.2,56.23]
    }
    let secondObject = {
      post_id:1,
      body:'Текст новости',
      header:'Заголовок новости'
    }
    let firstDBRecord = await sequelize.models.objects.create(firstObject);
    let secondDBRecord = await sequelize.models.objects.create(secondObject);
}
function readInformation(){
    //TODO: add reading information
}
if(mode===1) createDB();
if(mode===2){readInformation()}
//export default console.error('Не для экспорта!');