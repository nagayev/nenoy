//export default 1;
/*
https://allwebstuff.info/%D0%BA%D0%B0%D0%BA-%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D1%8C-orm-sequelize
*/
const mode = 1;
const Sequelize = require('sequelize'); //Подключаем библиотеку
const config =  {
  username: null,
  password: null, // Для sqlite пароль не обязателен
  database: 'test_db', // Имя базы данных
  host: 'localhost', // Адрес субд, для sqlite всегда локалхост
  dialect: 'sqlite', // Говорим, какую СУБД будем юзать
  dialectOptions: {
    multipleStatements: true
  },
  logging: console.log, // Включаем логи запросов, нужно передать именно функцию, либо false
  storage: './test_db.db', // Путь к файлу БД
  operatorsAliases: Sequelize.Op // Передаём алиасы параметров (дальше покажу нафига)
}

let sequelize = new Sequelize(config); // Создаём подключение
/*
 DB:
 TABLE Objects
 -----------------------------
 coords| posts  |type   |
  [0,0]|[2,4,7]|HOSPITAL|
  -----------------------------
  TABLE Posts
  post_id|
  1      |
 */
async function createDB(){
    let posts = sequelize.define('objects', {
        /*
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER
        }, */
        name: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false
        },
        coords:{
            type: Sequelize.DataTypes.ARRAY
        },
        type:{
            type: Sequelize.DataTypes.INTEGER
        },
        content: {
          type: Sequelize.DataTypes.STRING
        },
        header:{
            type: Sequelize.DataTypes.STRING
        },
      }, {
        timestamps: true // Колонки createdAt и updatedAt будут созданы автоматически
    });
    await sequelize.sync();
    let newPost = {
        title: 'Post title 1',
        body: 'Ololo ololo ya voditel NLO'
    }
    let newDBRecord = await sequelize.models.posts.create(newPost);
}
function readInformation(){
    //FIXME:
}
if(mode===1) createDB();
if(mode===2){readInformation()}