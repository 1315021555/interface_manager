var express = require('express');
var router = express.Router();

const {userHandler} = require('../controllers/user') 
const { SuccessModel,ErrorModel } = require("../model/responseModel");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('users page default');
});

router.post('/register',function(req,res,next){
    userHandler.register('test','123456').then(insertdata=>{
        console.log('insertdata',insertdata);
    })
    
    res.send(new SuccessModel('register success'));
})

module.exports = router;
