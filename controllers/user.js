const {execSQL} = require('../db/mysql');

let userHandler = {};

userHandler.register = (username,password)=>{
    let sql = `insert into user (user_name,password) values ('${username}','${password}')`;
    return execSQL(sql).then(registerData=>{
        if (registerData.affectedRows>0){
            return true;
        }
        return false;
    });
}



module.exports = {
    userHandler,
}
