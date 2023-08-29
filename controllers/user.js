const {execSQL} = require('../db/mysql');

let userHandler = {};

// 注册
userHandler.register = (username,password)=>{
    let sql = `insert into user (user_name,password) values ('${username}','${password}')`;
    return execSQL(sql);
}

// 登录
userHandler.login = (username,password)=>{
    let sql = `select * from user where user_name='${username}' and password='${password}'`;
    return execSQL(sql)
}

//查询用户参与项目
userHandler.list = (project_id)=>{
    let sql = `select * from project where project_id=${project_id}`;
    return execSQL(sql);
}



module.exports = {
    userHandler,
}
