/*
*   Purpose: Include couples of models to manage DB
*   Authors: Xiong, Hui, Jihye
*   Date:   2019-02-19
*
* */

//connect DB
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/travel_website',{server:{poolSize:20,reconnectTries: Number.MAX_VALUE }});

const conn = mongoose.connection;

conn.on('connected',()=>{
    console.log('connect succ');
})

conn.on('error',(err)=>{
    console.log('connect err' + err);
})

conn.on('disconnected',()=>{
    console.log("mongodb disconnected");
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
    post_tags:{type:Array},
    post_content:{type:String, required:true},
    post_imgURLs:{type:Array},
    comments:{type:Number},
    views:{type:Number},
    likes:{type:Number},
    post_time:{type:Number},

})

const PostModel = mongoose.model('post',postSchema);
exports.PostModel = PostModel;


//msg Schema
const chatSchema = mongoose.Schema({
    from:{type:String, required:true}, //sender_id
    to:{type:String,required:true},  //receiver_id
    chat_id:{type:String,required:true}, //concate from and to
    content:{type:String,required:true},
    read:{type:Boolean,default:false}, // read msg or not
    create_time:{type:Number}
})

const ChatModel = mongoose.model('chat',chatSchema);
exports.ChatModel = ChatModel;


//favorite articles Schema
const favSchema = mongoose.Schema({
    user_id: {type:String,required:true},
    fav_list: {type:Array}
})

const FavModel = mongoose.model('fav',favSchema);
exports.FavModel = FavModel;
