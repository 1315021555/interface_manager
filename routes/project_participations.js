var express = require('express');
var router = express.Router();
const {execSQL} = require('../db/mysql');

const { ProjectParticipation } = require('../controllers/project_participation');
const { SuccessModel,ErrorModel } = require("../model/responseModel");

//查询项目接口
router.get('/list',(req,res)=>{
    const project_id = req.query.project_id;
    let sql = `select * from project where project_id = ${project_id}`;
    execSQL(sql).then(result => {
        if (result.length == 0){
            res.send(new ErrorModel('项目不存在'));
            return;
        }
        else{
            ProjectParticipation.list(req,res);
        }
    })
        
})

//查询项目成员接口
router.get('/member',ProjectParticipation.member)

//添加项目成员
router.post('/add',(req,res) => {
    const {project_id,user_id,role_id} = req.body;
    let sql = `select * from project where project_id = '${project_id}'`;
    execSQL(sql).then(data => {
        if (data.length === 0){
            res.send(new ErrorModel('项目不存在'));
            return;
        }else{
            let sql = `select * from user where user_id = '${user_id}'`;
            execSQL(sql).then(data => {
                if (data.length === 0){
                    res.send(new ErrorModel('用户不存在'));
                    return;
                }else{
                    let sql = `select * from project_participation where user_id = ${user_id}`
                    execSQL(sql).then(data => {
                        console.log(data);
                        if(data.length){
                            res.send(new ErrorModel('用户已添加过'));
                        }else{
                            ProjectParticipation.add(project_id,user_id,role_id).then(()=>{
                                res.send(new SuccessModel('添加成功'));
                            })
                        }
                    })
                    
                    
                }
            })
        }
    })
});

module.exports = router;