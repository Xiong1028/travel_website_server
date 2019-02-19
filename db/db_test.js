/*
 * Purpose: test mongodb
 * Author:  XiongLi
 * Date: 2019-02-18
*/

const md5 = require('blueimp-md5');

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/travel_website');

const conn = mongoose.connection;

conn.on('connected',()=>{
  console.log('connect succ');
})

const userSchema = mongoose.Schema({
  username:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required: true
  },
  email:{
    type:String,
    required:true
  },
  avatar:{
    type:String
  }
})

const UserModel = mongoose.model('user',userSchema);

//save()
const testSave = (userModel) =>{
  userModel.save((err,userDoc) =>{
    console.log('save()',err,userDoc);
  })
}

const userModel1 =  new UserModel({username:"Jim",password:md5('abc'),email:'Jim@gmail.com'});

testSave(userModel1);

