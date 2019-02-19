var express = require('express');
var router = express.Router();

const md5 = require('blueimp-md5');
const {UserModel, PostModel} = require('../db/models');

//define a filter
const filter = {
  password:0,
  _v:0
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


//API for register
router.post('./register',(req,res)=>{
  //get the request object from the request body
  const {username,password,email} = req.body;

  UserModel.findOne({
    username
  },(err,userDoc)=>{
    if(userDoc){
      res.send({code:0,msg:'Sorry, the username is unavailable'});
    }else{
      new UserModel({username,password:md5(password),email}).save((err,user)=>{
        //once you set the maxAge of cookie, it is longer cookie, not session cookie
        res.cookie('user_id',user._id,{
          maxAge:1000*60*60*24
        });

        const data = {
          username,
          email,
          _id:user._id
        };
        res.send({code:0,data});
      })
    }
  })
})




































module.exports = router;
