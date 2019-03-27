var express = require('express');
var router = express.Router();
var multer = require("multer");
var path = require('path');
var fs = require("fs");
var async = require("async");

const md5 = require('blueimp-md5');
const {UserModel, PostModel} = require('../db/models');


//define a filter
const filter = {
	password: 0,
	_v: 0
}

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', {title: 'Express'});
});

//API for register
router.post('/register', (req, res) => {
	//get the request object from the request body
	const {username, password, email} = req.body;

	UserModel.findOne({
		username
	}, (err, userDoc) => {
		if (userDoc) {
			res.send({code: 0, registerMsg: 'Sorry, the username is unavailable'});
		} else {
			new UserModel({username, password: md5(password), email}).save((err, user) => {
				//once you set the maxAge of cookie, it is longer cookie, not session cookie
				res.cookie('userid', user._id, {
					maxAge: 1000 * 60 * 60 * 24
				});
				const userData = {
					username,
					email,
					_id: user._id
				};
				res.send({code: 1, data: userData});
			})
		}
	})
})


// API for login
router.post('/login', (req, res) => {
	const {username, password} = req.body;

	//query the databases according to username and password
	UserModel.findOne({
		username,
		password: md5(password)
	}, filter, (err, userDoc) => {
		if (userDoc) {
			res.cookie('userid', userDoc._id, {
				maxAge: 1000 * 60 * 60 * 24
			});

			res.send({code: 1, data: userDoc});
		} else {
			res.send({code: 0, loginMsg: 'username or password is invalid'});
		}
	})
})


//API for post
router.post('/post', (req, res) => {
	//get the logined userid from cookie
	const userid = req.cookies.userid;
	const {post_title, post_tags, post_content, post_imgURL} = req.body;

	const postData = {
		user_id: userid,
		post_title: post_title,
		post_tags: post_tags,
		post_content: post_content,
		post_imgURLs: post_imgURL,
		comments: 0,
		views:0,
		likes:0,
		post_time: new Date()
	}

	new PostModel(postData).save((err, postDoc) => {
		var resPostData = {
			user_id: userid,
			post_id: postDoc._id,
			cover_imgURL: postDoc.post_imgURLs[0],
			post_title: postDoc.post_title,
			post_tags: postDoc.post_tags,
			post_content: postDoc.post_content,
			post_time: postDoc.post_time,
			views: postDoc.views,
			likes:postDoc.likes,
			comments: postDoc.comments
    }
    
		UserModel.findById(userid,(err,userDoc)=>{
			resPostData['username'] = userDoc.username;
			resPostData['email'] = userDoc.email;
			resPostData['avatar'] = userDoc.avatar;
			console.log(resPostData);

			res.send({code: 1, data: resPostData});
		})
	})

})


//WAY 1 FOR Api for profile.
/*
var upload = multer({
    dest: 'public/uploads'
});

router.post('/profile', upload.single('avatar'), (req, res, next) => {
    const userid = req.cookie.userid;

    console.log(userid);
    fs.rename(req.file.path, "uploads/" + req.file.originalname, function (err) {
        res.send({code:0,data:{"filename":"jpg"}});
    })
})
*/

router.post('/profile', (req, res) => {
	//get uerid from cookie
	const userid = req.cookies.userid;
	if (!userid) {
		return res.send({code: 0, msg: "Please Login"});
	}
	const {user_imgUrl} = req.body;

	UserModel.findOneAndUpdate({_id: userid}, {avatar: user_imgUrl}, (err, userDoc) => {
		const resUserData = {
			userid: userDoc._id,
			username: userDoc.username,
			email: userDoc.email,
			avatar: userDoc.avatar
		}
		res.send({code: 1, data: resUserData});
	})
})

router.post('/reset', (req, res) => {
	//get uerid from cookie
	const userid = req.cookies.userid;

	if (!userid) {
		return res.send({code: 0, msg: "Please Login"});
	}

	const {password} = req.body;

	UserModel.findOneAndUpdate({_id: userid}, {password: md5(password)}, (err, userDoc) => {
		if (userDoc) {
			res.send({code: 1, rstMsg: "Reset password success!"});
		} else {
			res.send({code: 0, rstMsg: "Reset password fail!"});
		}
	})
})

router.post('/updateAva', (req, res) => {
	//get uerid from cookie
	const userid = req.cookies.userid;

	if (!userid) {
		return res.send({code: 0, msg: "Please Login"});
	}

	UserModel.findOne({_id: userid}, (err, userDoc) => {
		console.log(userDoc);
		if (userDoc) {
			res.send({
				code: 1,
				data: userDoc.avatar
			})
		} else {
			res.send({code:0, updAvaMsg: "Updata avatar fail!"})
		}
	})
})

//Api for all the post data
router.get('/fetchAll',(req,res)=>{   
  PostModel.find({}).sort({'post_time':-1}).exec((err,postDocs)=>{
			processArray(postDocs,res);
  })
})


//Api for get the article of specifical id
router.get('/detail/:id',(req,res)=>{
	let post_id = req.params.id;
	
	PostModel.findOne({_id:post_id},(err,postDoc)=>{
		getOneUserData(postDoc,res);	
	})	
})

module.exports = router;




//====================functions below ========================

//handle all posts data including users info
async function processArray(postDocs,res){
	let newCardList =[];
		for(let item of postDocs){
			usrData = await processUserDoc(item.user_id);
			const newCard={
				user_id: item.user_id,
				post_id: item._id,
				cover_imgURL: item.post_imgURLs[0],
				post_title: item.post_title,
				post_tags: item.post_tags,
				post_content: item.post_content,
				post_time: item.post_time,
				views: item.views,
				likes:	item.likes,
				comments: item.comments,
				username:usrData.username,
				avatar:usrData.avatar,
				email:usrData.email
			}
			newCardList.push(newCard);
		}
		console.log(newCardList);
		res.send({code:1,data:newCardList});
}

//handle a article detail including user info
async function getOneUserData(postDoc,res){
	const userDoc = await processUserDoc(postDoc.user_id);
	let articleData ={
			user_id: postDoc.user_id,
			post_id: postDoc._id,
			cover_imgURL: postDoc.post_imgURLs[0],
			post_title: postDoc.post_title,
			post_tags: postDoc.post_tags,
			post_content: postDoc.post_content,
			post_time: postDoc.post_time,
			views: postDoc.views,
			likes:	postDoc.likes,
			comments: postDoc.comments,
			username:userDoc.username,
			avatar:userDoc.avatar,
			email:userDoc.email
	};
	console.log(articleData);
	res.send(articleData);
}

async function processUserDoc(userId){
	let UserData = await getUser(userId);
	return UserData;
}

function getUser(userId){
	return new Promise((resolve,reject)=>{
		UserModel.findOne({_id: userId},(err,userDoc)=>{
				resolve(userDoc);
		})
	})
}
