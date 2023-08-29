let MYSQL_CONFIG = {};

//本地配置
MYSQL_CONFIG = {
    host:'127.0.0.1',   
    user:'root',
    password:'123456',
    port:'3306',
    database:'interface_manager'
}

// 服务器配置
/* MYSQL_CONFIG = {
    host:'127.0.0.1',   
    user:'interface_mnger',
    password:'20030731.lzc',
    port:'3306',
    database:'interface_mnger'
}
 */


module.exports = {
    MYSQL_CONFIG,
}