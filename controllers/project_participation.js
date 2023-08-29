const {execSQL} = require('../db/mysql');
const { SuccessModel,ErrorModel } = require("../model/responseModel");

const ProjectParticipation = {};

//查询项目接口
ProjectParticipation.list = async (req,res) => {
    const project_id = req.query.project_id;
      // 查询每个 interface_id 对应的最新版本号
    const sql1 = `SELECT  interface_id, MAX(version_id) AS version_id FROM interface GROUP BY interface_id`;
    const data = await execSQL(sql1);

    // 使用 Promise.all() 等待所有异步操作完成
    const result = await Promise.all(data.map(async item => {
        console.log(item);
        const sql2 = `SELECT * FROM interface WHERE interface_id = ${item.interface_id} AND (version_id = ${item.version_id}) AND (project_id = ${project_id})`;
        const data2 = await execSQL(sql2);

        const singleData = data2.map(item => ({
            ...item,
            request_params: JSON.parse(item.request_params),
            response_data: JSON.parse(item.response_data)
        }));
        return singleData[0];

    }));

    res.send(new SuccessModel(result,'查询成功'));
}

//查询项目成员
ProjectParticipation.member =  (req,res) => {
    const project_id = req.query.project_id;
    let sql = `select * from project_participation where project_id = ${project_id}`;
    execSQL(sql).then(async partResult => {
        console.log('partResult',partResult);
        if(partResult.length){
            const result = await Promise.all(partResult.map(async item => {
                const sql = `select * from user where user_id = ${item.user_id}`;
                const data = await execSQL(sql);
                return {
                    user_name: data[0].user_name,
                    role_id: item.role_id,
                    user_id: item.user_id
                }
            }))
            res.send(new SuccessModel(result,'查询成功'));
            
        }else{
            res.send(new ErrorModel('查询失败'));
        }
    })
}

//添加项目成员
ProjectParticipation.add = (project_id,user_id,role_id) => {
    let sql = `insert into project_participation (project_id,user_id,role_id) values ('${project_id}','${user_id}','${role_id}')`;
    return execSQL(sql);
}

module.exports = {
    ProjectParticipation
}