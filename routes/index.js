var express = require('express');
var router = express.Router();

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


//API for login
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
	const {post_title,post_tags,post_content, post_imgURL} = req.body;

	const postData = {
		user_id:userid,
		post_title:post_title,
		post_tags:post_tags,
		post_content:post_content,
		post_imgURL:post_imgURL,
		read_total:0,
		post_time:new Date()
	}

	new PostModel(postData).save((err,postDoc)=>{
		const postData={
			user_id:userid,
			post_id:postDoc._id
		}
		res.send({code:1,data:postData})
	})

})

module.exports = router;
