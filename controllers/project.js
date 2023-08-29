const {execSQL} = require('../db/mysql');

const {SuccessModel,ErrorModel} = require('../model/responseModel');
const projectHandler = {};

//查询项目表
projectHandler.list = (req,res) => {
    const {page,pageSize} = req.query;
    const {keyword} = req.query;
    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    if(keyword.length == 0){
        let sql = `select * from project order by project_id asc`;
        execSQL(sql).then(async result => {
        const paginatedResult = result.slice(startIndex, endIndex);
        if (startIndex >= result.length) {
            res.send(new ErrorModel('顶码超凿范囥'));
        }
        else{
            res.send(new SuccessModel(paginatedResult, '查询成功'));
        }
        })  
    }else{
        let sqlkey = `select * from project where name like '%${keyword}%'`;
        execSQL(sqlkey).then(async result => {
            if(result.length){
                res.send(new SuccessModel(result, '查询成功'));
            }else{
                res.send(new ErrorModel('查询不到该关键字'));
            }
        })
    }
    
}

//创建项目列表
projectHandler.create = (Name,description,creator_id,created_at) => {
    let sql = `insert into project (name,description,creator_id,created_at) values ('${Name}','${description}',${creator_id},'${created_at}')`;
    return execSQL(sql);
}

//删除项目
projectHandler.delete = (project_id) => {
    let sql = `delete from project where project_id = ${project_id} order by project_id asc`;
    return execSQL(sql);
}

module.exports = {
    projectHandler
}