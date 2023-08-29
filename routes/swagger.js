const swaggerParser = require('@apidevtools/swagger-parser')
const fs = require('fs')
const swaggerJsonFile = fs.readFileSync('./routes/test.json', 'utf8')
var express = require('express');
var router = express.Router();


swaggerParser.parse(swaggerJsonFile).then((api)=>{
    console.log(api);
    
}).catch(err=>{
    console.log(err);
})


module.exports = router;