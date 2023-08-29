var express = require('express');
var router = express.Router();
const {execSQL} = require('../db/mysql');
const { SuccessModel,ErrorModel } = require("../model/responseModel");
const moment = require('moment');

// 新增接口
router.post('/add',(req,res)=>{
    let {method,url,name,catalog_name,description,request_params,response_data,project_id,created_by} = req.body;
    request_params = JSON.stringify(request_params);
    response_data = JSON.stringify(response_data);

    // 获取当前时间对应的mysql中给datetime格式，实例值：'2023-08-11 15:30:45'
    let cur_datetime = new Date().toLocaleString().replace(/\//g,'-');
    // 进一步改为YY-MM-DD HH:MM:SS
    //cur_datetime = cur_datetime.split(' ')[0].split('-').map(item=>item.length<2?'0'+item:item).join('-')+' '+cur_datetime.split(' ')[1];
    let sql = `insert into interface (method,url,name,catalog_name,description,request_params,response_data,project_id,created_by,created_at) values ('${method}','${url}','${name}','${catalog_name}','${description}','${request_params}','${response_data}','${project_id}',${created_by},'${cur_datetime}')`;
    execSQL(sql).then(data=>{
        res.send(new SuccessModel('新增成功'));
    })
})

// 删除接口
router.post('/delete',(req,res)=>{
    let {interface_id} = req.body;
    let sql1 = `select * from interface where interface_id = '${interface_id})'`
    execSQL(sql1).then(data=>{
        if (data.length<=0){
            res.send(new ErrorModel('接口不存在'));
        }
        else{
            let sql2 = `delete from interface where interface_id = '${interface_id}'`; 
            execSQL(sql2).then(data=>{
                res.send(new SuccessModel('删除成功'));
            }) 
        }
    })
})


// 修改接口，并且自动记录该接口的历史记录
router.post('/update',(req,res)=>{
    let {interface_id,method,url,name,catalog_name,description,request_params,response_data,change_info,created_by} = req.body;
    request_params = JSON.stringify(request_params);
    response_data = JSON.stringify(response_data);
    let sql1 = `select * from interface where interface_id = ${interface_id} `;

    execSQL(sql1).then(data=>{
        console.log(data);
        if (data.length<=0){
            res.send(new ErrorModel('接口不存在'));
        }
        else{
            // 得到当前接口的version_id与project_id
            let cur_version_id = data[data.length-1].version_id;
            let project_id = data[0].project_id;
            // 往接口列表中插入一条新接口记录，其中interface_id不变， version_id+1
            let cur_datetime = new Date().toLocaleString().replace(/\//g,'-');
            let sql3 = `insert into interface (interface_id,project_id,version_id,method,url,name,catalog_name,description,request_params,response_data,created_by,created_at,change_info) values ('${interface_id}',${project_id},'${cur_version_id+1}','${method}','${url}','${name}','${catalog_name}','${description}','${request_params}','${response_data}',${created_by},'${cur_datetime}','${change_info}')`;
            execSQL(sql3).then(data=>{
                res.send(new SuccessModel('修改成功'));
            })
        }
    }).catch(err=>{
        console.log('err here');
        console.log(err);
        res.send(new ErrorModel(err,"接口不存在"));
    })
})


// 查询某个接口（某版本）信息
router.get('/query',(req,res)=>{
    let {interface_id,version_id} = req.body;
    let sql = `select * from interface where interface_id = '${interface_id}' and version_id = '${version_id}'`;
    execSQL(sql).then(data=>{
        if (data.length<=0){
            res.send(new ErrorModel('接口不存在'));
        }
        else{
            const interfaceData = {
                ...data[0],  // 获取数据库返回的接口数据
                request_params: JSON.parse(data[0].request_params),
                response_data: JSON.parse(data[0].response_data),
                created_at: moment(data[0].created_at).format('YYYY-MM-DD HH:mm:ss') // 格式化时间
            };
            res.send(new SuccessModel(interfaceData,'查询成功'));
            // 返回的created_at和mysql中datetime格式不一致，需要转换

        }
    })
})


// 查询某接口的所有版本信息
router.get('/queryAllVersions',(req,res)=>{
    let {interface_id} = req.body;
    let sql = `select * from interface where interface_id = '${interface_id}'`;
    execSQL(sql).then(data=>{
        if (data.length<=0){
            res.send(new ErrorModel('接口不存在'));
        }
        else{
            const interfaceData = data.map(item=>{
                return {
                    ...item,
                    request_params: JSON.parse(item.request_params),
                    response_data: JSON.parse(item.response_data),
                    created_at: moment(data[0].created_at).format('YYYY-MM-DD HH:mm:ss') // 格式化时间
                }
            });
            res.send(new SuccessModel(interfaceData,'查询成功'));
        }
    })
})


// 查询所有接口最新版本列表
/* router.get('/queryAll',(req,res)=>{
    
    // 查询每个interface_id对应的最新版本号
    let sql1 = `select interface_id,max(version_id) as version_id from interface group by interface_id`;
    execSQL(sql1).then(data=>{
        // 得到每个interface_id对应的最新版本号
        console.log(data);
        const result = [];
        for (const k in data){
            let sql2 = `select * from interface where interface_id = '${data[k].interface_id}' and version_id = '${data[k].version_id}'`;
            execSQL(sql2).then(data2=>{   
                console.log('data22222222',data2);     
                const interfaceData = data2.map(item=>{
                    return {
                        ...item,
                        request_params: JSON.parse(item.request_params),
                        response_data: JSON.parse(item.response_data)
                    }
                });
                result.push(interfaceData);
            })
        }
        res.send(new SuccessModel(result,'查询成功'));

    }).catch(err=>{
        console.log(err);
        res.send(new ErrorModel(err,'查询失败'));
    })

}) */




// 查询所有接口最新版本列表
router.get('/queryAll', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // 页码，默认为1
        const keyword = req.query.keyword || ''; // 关键字，默认为空
        const pageSize = parseInt(req.query.pageSize) || 10; // 每页数量，默认为10

        // 查询每个 interface_id 对应的最新版本号
        const sql1 = `SELECT interface_id, MAX(version_id) AS version_id FROM interface where name like '%${keyword}%' GROUP BY interface_id`;
        const data = await execSQL(sql1);

        // 使用 Promise.all() 等待所有异步操作完成
        const result = await Promise.all(data.map(async item => {
            const sql2 = `SELECT * FROM interface WHERE interface_id = ${item.interface_id} AND version_id = ${item.version_id}` ;
            const data2 = await execSQL(sql2);
            console.log('data2',data2);
            const singleData = data2.map(item => ({
                ...item,
                request_params: JSON.parse(item.request_params),
                response_data: JSON.parse(item.response_data),
                created_at: moment(data[0].created_at).format('YYYY-MM-DD HH:mm:ss') // 格式化时间
            }));
            return singleData[0];
        }));

        // 分页处理
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedResult = result.slice(startIndex, endIndex);
        if (startIndex > result.length) {
            res.send(new ErrorModel('页码超出范围'));
        }
        else{
            res.send(new SuccessModel(paginatedResult, '查询成功'));
        }
    } catch (error) {
        console.error(error);
        res.send(new ErrorModel(error, '查询失败'));
    }
});








module.exports = router;