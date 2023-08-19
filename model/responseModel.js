class BaseModel {
    constructor(data,message) {
        if(typeof data === 'string'){       // 若只传入一个string参数，那么这个参数就是message
            this.message = data;
            data = null;
            message = null;
        }

        if(data){
            this.data = data;
        }
        if(message){
            this.message = message;
        }
    }
}

// 成功的模型
class SuccessModel extends BaseModel{
    constructor(data,message){
        super(data,message);
        this.code = 200;
        this.errno = 0;
    }
}

// 失败的模型
class ErrorModel extends BaseModel{
    constructor(data,message){
        super(data,message);
        this.errno = -1;
    }
}

module.exports = {
    SuccessModel,
    ErrorModel
}