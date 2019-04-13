var express = require('express');
var router = express.Router();
var multer = require("multer");
var path = require('path');
var fs = require("fs");
var async = require("async");

const md5 = require('blueimp-md5');
const {UserModel, PostModel,ChatModel, FavModel} = require('../db/models');


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

	UserModel.findOneAndUpdate({_id: userid}, {avatar: user_imgUrl},{new:true},(err, userDoc) => {
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


//Api for getting one user
router.post('/getuser',(req,res)=>{
	//get uerid from cookie
	const userid = req.cookies.userid;

	if (!userid) {
		return res.send({code: 0, msg: "Please Login"});
	}
	UserModel.findOne({_id: userid},filter, (err, userDoc) => {
		if (userDoc) {
			res.send({code: 1,data: userDoc});
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

//Api for getting the user and get all the posts related to this user
router.get('/author/:user_id',(req,res)=>{
	//get user_id from the request path
	let user_id = req.params.user_id;

	PostModel.find({user_id:user_id},(err,postDocs)=>{
		processArray(postDocs,res);
	})
})


//API for updating likes number
router.post('/updatelike', (req, res) => {
	const { post_id} = req.body;

	PostModel.findOneAndUpdate({_id: post_id}, {$inc: {likes: 1}}, {new: true}, (err, postDoc) => {
		getOneUserData(postDoc,res);
	})
})


//API for updating views number
router.post('/updateview', (req, res) => {
	const { post_id} = req.body;

	PostModel.findOneAndUpdate({_id: post_id}, {$inc: {views: 1}}, {new: true}, (err, postDoc) => {
		getOneUserData(postDoc,res);
	})
})


//API for saving favourite articles
router.post('/savearticle', (req, res) => {
	const { post_id, user_id } = req.body;

	FavModel.findOne({user_id: user_id}, (err,favDocs) => {
		if(favDocs) {
			// if post_id dosen't exist in fav_list, push post_id
			if(!favDocs.fav_list.includes(post_id)){
				FavModel.update(
					{user_id: user_id}, 
					{$push: {fav_list: post_id}},
					(err, favDocs) => {
						res.send({
							code: 1,
							data: favDocs
						});
					}
				)
			}
		} else {
			const favData = {
				user_id: user_id,
				fav_list: [post_id]
			}
			new FavModel(favData).save((err, favDocs) => {
				res.send({code: 1, data: favDocs});
			})
		}
	})	
})


//API for getting favorite articles List info
router.get('/favorite/:user_id', (req, res) => {
	//get user_id from the request path
	let user_id = req.params.user_id;

	FavModel.find({user_id:user_id},(err,favDocs)=>{
		console.log(favDocs);
		processFavArray(favDocs, res);
	})
})


//Api for msglist
router.get("/msglist",(req,res)=>{
	//get cookie userid
	const user_id = req.cookies.userid;

	//query all the users 
	UserModel.find((err,userDocs)=>{

		//save all the users in an object by using user_id as key, name and avatar as value object
		const users = {};

		userDocs.forEach(doc=>{
			users[doc._id] = {username:doc.username,avatar:doc.avatar};
		})

		/*
			all chat history	related to user_id
			parameter 1: query condition
			parameter 2: filter condition
			parameter 3: callback function
		*/

		ChatModel.find({'$or':[{from:user_id},{to:user_id}]},filter,(err,chatMsgs)=>{
			//return an array with all msgs related to user_id
			res.send({code:1,data:{users,chatMsgs}});
		})

	})
})

//Api for reading msg
router.post("/readmsg",(req,res)=>{
	//get the from and to
	const from = req.body.from;
	const to = req.cookies.userid;

	/*
		update the chat msg
		@param1 query condition
		@param2 update the designated object
		@param3 update multiple msgs, default 1
		@param4 callback
	*/

	ChatModel.update({from,to,read:false},{read:true},{multi:true},(err,doc)=>{
		console.log("/readmsg",doc);
		res.send({code:1,data:doc.nModified});
	})
})

module.exports = router;


//==================== functions below ========================

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
			likes: postDoc.likes,
			comments: postDoc.comments,
			username:userDoc.username,
			avatar:userDoc.avatar,
			email:userDoc.email
	};
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

//handle all favorite ariticle data including article post and author info
async function processFavArray(favDocs, res){
	let newFavCardList =[];
	let favList = favDocs[0].fav_list;
		for(let item of favList){
			postData = await processPostDoc(item);
			usrData = await processUserDoc(postData.user_id);
			const newFavCard={
				post_id: item,
				user_id: postData.user_id,
				post_title: postData.post_title,
				post_tags: postData.post_tags,
				cover_imgURL: postData.post_imgURLs[0],
				post_content: postData.post_content,
				post_time: postData.post_time,
				views: postData.views,
				likes:	postData.likes,
				comments: postData.comments,
				username:usrData.username,
				avatar:usrData.avatar,
				email:usrData.email
			}
			newFavCardList.push(newFavCard);
		}
		res.send({code:1,data:newFavCardList});
}

async function processPostDoc(postId){
	let postData = await getPost(postId);
	return postData;
}

function getPost(postId){
	return new Promise((resolve,reject)=>{
		PostModel.findOne({_id: postId},(err,postDoc)=>{
				resolve(postDoc);
		})
	})
}
