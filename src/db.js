const Sequelize = require('sequelize'); //Подключаем библиотеку
const { QueryTypes } = Sequelize;
const config =  {
    username: null,
    password: null, // Для sqlite пароль не обязателен
    database: 'test_db', // Имя базы данных
    host: 'localhost', // Адрес субд, для sqlite всегда локалхост
    dialect: 'sqlite', // Говорим, какую СУБД будем юзать
    dialectOptions: {
      multipleStatements: true
    },
    logging: false,//console.log, // function or false
    storage: './objectswithposts.db', // Путь к файлу БД
    operatorsAliases: Sequelize.Op // Передаём алиасы параметров (дальше покажу нафига)
}  
let sequelize = new Sequelize(config); // Создаём подключение
async function createObject(arg){
    const {type,coords,name} = arg;
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
        },
        checked:{
          type: Sequelize.DataTypes.BOOLEAN
        }
      }, {
        timestamps: false //NOTE:нужны ли таймстемпы????
    }); 
    await sequelize.sync();
    let firstObject = {
        name: name,
        type: type,
        posts:[1,2,3],
        coords:coords,
        checked:false
    }
    //console.log(objects)
    await sequelize.models.objects.create(firstObject);
}
async function createPost(arg){
    const {header,content} = arg;
    let posts = sequelize.define('posts',{
      header:{
        type:Sequelize.DataTypes.STRING
      },
      content:{
        type:Sequelize.DataTypes.STRING
      },
      checked:{
        type: Sequelize.DataTypes.BOOLEAN
      }
    },{
      timestamps: true // Колонки createdAt и updatedAt будут созданы автоматически
    })
    await sequelize.sync();
    let secondObject = {
      content,
      header,
      checked:false
    }
    await sequelize.models.posts.create(secondObject);
}
async function createDB(arg){
  //FIXME: posts not used!
  const {type,name,posts,coords,content,header} = arg;
  createObject({type,coords,name});
  createPost({content,header});
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
//TEST
if(require.main===module){
    //Run directly from bash
    //NOTE: works as INSERT
    createObject({type:1,coords:[22.1,23.2],name:'abc'});
    createPost({header:'Post header',content:'Content'})
}
//export {createDB,createObject,createPost};