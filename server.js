var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();

// 专门用来处理post提交方式
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// 返回的内容   建议规范
var objResult = {
    flag: true,
    msg:'',
    data:{},
    timestamp:0
}
// 连接数据库的
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'db_news'
});

//数据库连接     引入模块 创建链接 真正链接
connection.connect();

//指定一个静态目录  请求 不用每一个都去get请求   所以html 资源 js
app.use(express.static('./news'));

// 处理get请求                 返回  请求（请求头、数据）
app.get('/api/news',function (req, res) {
    // 当客户端有get请求
    // res.header('Access-Control-Allow-Origin', '*');
    // //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
    // res.header('Access-Control-Allow-Headers', 'Content-Type');
    // res.header('Access-Control-Allow-Methods', '*');
    // res.header('Content-Type', 'application/json;charset=utf-8');
    // res.send('这是来自服务器的问候\n');
    // res.send(req.query.uid);

    // 获取请求的值
    var data = req.query;

    switch (data.type) {
        case 'get':
            getNews();
            break;
        // 删除
        case 'del':
            delNews();
            break;

        default:
            showNews();
            break;
    }
    // 数据库查找 id
    function getNews() {
        connection.query('select * from news where id='+data.id,function (error, results) {
            if(error){
                console.log(error.message);
            }else{
                res.json(results);
            }
        })
    }
    // 数据库查找表
    function showNews() {
        connection.query('select * from news',function (error, results) {
            if(error){
                console.log(error.message);
            }else{
                res.json(results);
                // res.jsonp(results);
            }
        })
    }
    // 删除表中的id          删除按钮
    function delNews() {
        connection.query('delete from news where id='+data.id,function (error, results) {
            if(error){
                console.log(error.message);
            }else{
                objResult.flag = true;
                objResult.msg = '删除成功';
                objResult.timestamp = Date.now();
                res.json(objResult);
                return;
            }
        })
    }
});


//1、 判断输入的用户名密码是否和已存的相等
app.post('/api/news',function (req, res) {
    var json = req.body;
    var title;
    for(var i=0;i<json.data.length;i++){
        if(json.data[i].name == 'title'){
            title = json.data[i].value;
            break;
        }
    }
    var content;
    for(var i=0;i<json.data.length;i++){
        if(json.data[i].name == 'content'){
            content = json.data[i].value;
            break;
        }
    }

    // 2、如果添加为空  页面提示用户名不能为空   添加按钮的事件
    if(json.type == 'add'){
        if(title == ''){
            objResult.flag = false;
            objResult.msg = '标题不能为空';
            objResult.timestamp = Date.now();
            res.json(objResult);
            return;
        }
        // 如果新增的用户名重复  页面提示
        connection.query('select * from news where title="'+title+'"',function (error, results) {
            if(error){
                console.log(error.message);
            }else{
                if(results.length != 0){
                    objResult.flag = false;
                    objResult.msg = '标题重复';
                    objResult.timestamp = Date.now();
                    res.json(objResult);
                    return;
                }else{
                    // 不重复且密码加上 页面提示
                    connection.query('INSERT INTO news (title,content) VALUES ("'+title+'","'+content+'")',function (error, results) {
                        if(error){
                            console.log(error.message);
                        }else {
                            objResult.flag = true;
                            objResult.msg = '添加成功';
                            objResult.timestamp = Date.now();
                            res.json(objResult);
                            return;
                        }
                    })
                }
            }
        })
    }
    // 修改事件      新增按钮变修改
    if(json.type == 'edit'){
        connection.query('update news set title="'+title+'",content="'+content+'" where id='+json.id,function (error, results) {
            if(error){
                console.log(error.message);
            }else {
                objResult.flag = true;
                objResult.msg = '修改成功';
                objResult.timestamp = Date.now();
                res.json(objResult);
                return;
            }
        })
    }

});

// 一个端口只能有一个监听者 不同端口-跨域
app.listen(808,function () {
    console.log('服务器监听在808端口');
})

// 默认端口号   80 www   21 ftp   3306 mysql
// var app = require('express')();

