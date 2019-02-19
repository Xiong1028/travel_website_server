/*
*   Purpose: Include couples of models to manage DB
*   Authors: Xiong, Hui, Jihye
*   Date:   2019-02-19
*
* */

//connect DB
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/travel_website');
const conn = mongoose.connection;
conn.on('connected',()=>{
    console.log('connect succ');
})

//define Schema
const userSchema = mongoose.Schema({
    username:{type:String,required:true},
    password:{type:String,required:true},
    email:{type:String,required:true},
    avatar:{type:String}
})

//Define Mode constructor
const UserModel = mongoose.model('user',userSchema);
//export Model
exports.UserModel = UserModel;


//Define another Schema called postSchema
const postSchema = mongoose.Schema({
    user_id:{type:String,required:true},
    post_title:{type:String,required:true},
    post_content:{type:String, required:true},
    post_img:{type:String},
    read:{type:String,required:true},
    create_time:{type:Number}
})

const PostModel = mongoose.model('post',postSchema);
exports.PostModel = PostModel;