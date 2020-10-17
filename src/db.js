const Sequelize = require('sequelize');
const { QueryTypes } = Sequelize;
const config =  {
    username: null,
    password: null, // Для sqlite пароль не обязателен
    database: 'test_db', // name
    host: 'localhost', // always localhost for sqlite
    dialect: 'sqlite', 
    dialectOptions: {
      multipleStatements: true
    },
    logging: false,//function like console.log or false
    storage: './objectswithposts.db', 
    operatorsAliases: Sequelize.Op // Передаём алиасы параметров (дальше покажу нафига)
}  
let sequelize = new Sequelize(config); 
async function appendObject(arg){
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
        timestamps: false //NOTE:timestampts????
    }); 
    await sequelize.sync();
    let firstObject = {
        name: name,
        type: type,
        posts:[1,2,3],
        coords:coords,
        checked:true //NOTE: temporarly
    }
    await sequelize.models.objects.create(firstObject);
}
async function appendPost(arg){
    const {header,content} = arg;
    let posts = sequelize.define('posts',{
      header:{
        type:Sequelize.DataTypes.STRING
      },
      content:{
        type:Sequelize.DataTypes.STRING
      },
      type:{
        type:Sequelize.DataTypes.INTEGER
      },
      checked:{
        type: Sequelize.DataTypes.BOOLEAN
      }
    },{
      timestamps: true // add createdAt and updatedAt automatically
    })
    await sequelize.sync();
    let secondObject = {
      content,
      header,
      checked:true //TODO: change to false, it's 
    }
    await sequelize.models.posts.create(secondObject);
}
async function append2DB(arg){
  //FIXME: posts not used!
  const {type,name,posts,coords,content,header} = arg;
  appendObject({type,coords,name});
  appendPost({content,header,type});
}
//FIXME: why????
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
async function getPosts(type){
  const posts = await sequelize.query(`SELECT * from posts WHERE checked=1 and type=${type}`,{ type: QueryTypes.SELECT });
  return posts
}

async function readCoords(){
  //FIXME: bad perfomance (eval is evil)
  let objects;
  objects = await sequelize.query(`SELECT coords from objects WHERE checked=1;`,{ type: QueryTypes.SELECT });
  objects=objects.map(value=>{
    return eval(`[${value.coords}]`)
  });
  return objects;
}
//TEST
if(require.main===module){
    //directly from bash
    //NOTE: works as INSERT
    //appendObject({type:1,coords:[22.1,23.2],name:'abc'});
    //appendPost({header:'Post header',content:'Content'})
    readCoords().then(data=>console.log(data))
}
else{
  module.exports={append2DB,appendObject,appendPost,readCoords,getPosts};
}
//export {append2DB,appendObject,appendPost};