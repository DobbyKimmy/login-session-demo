// 加载 http模块
var http = require('http');
// 加载fs模块，fs即 filesystem 的缩写
// fs模块提供本地文件的读写能力，提供异步和同步两种操作方式
// 异步读写：readFile('path',callbackFn),writeFile('path',callbackFn)
// 同步读写：readFileSync(fileName,'utf8'),writeFileSync(fileName,str,'utf8')
var fs = require('fs');
// 加载url模块, url 模块用于生成和解析URL
var url = require('url');
// process对象是Node的一个全局对象,它可以在脚本的任意位置使用,不必通过require命令加载
// process.argv属性返回一个数组,由命令行执行脚本的各个参数组成
// process.argv[0] --->第一个成员总是node
// process.argv[1] --->第二个成员是脚本文件名,在本示例中为 server.js
// process.argv[2...] ---> 其余成员是脚本文件的参数,在本示例中为 指定的端口号如：8888
var port = process.argv[2];
// 导入 md5模块
var md5 = require('md5');


if(!port){
    console.log('Please appoint the port number like:node server.js 8888');
    // process.exit 方法用来退出当前进程,如果参数大于0表示失败,如果参数等于0表示成功
    process.exit(1);
}

// add Session
var mySession = {};

// createServer方法用于创造一个服务器实例
var server = http.createServer(function(request,response){
    // path with query
    var pathWithQuery = request.url;
    // path no query
    var path = url.parse(request.url,true).pathname;
    // query
    var query = url.parse(request.url,true).query;
    // request method ：get or post or ...
    var method = request.method;



    // get请求 注册页面
    if(path === '/regist' && method === 'GET'){
        let string = fs.readFileSync('./regist.html','utf8');
        response.statusCode = 200;
        response.setHeader('Content-Type','text/html;charset=utf-8');
        response.write(string);
        response.end();
    }

    // post请求,提交注册信息
    if(path ==='/regist' && method ==='POST'){
        readPostData(request)
            .then(
                (body)=>{
                    let userMessage = {};

                    // 省略了后端的数据校验 ...
                    // body(string): email=1%40qq.com&password=1&passwordConfirm=1 (%40 --> @)
                    body.split('&')// ['email=1%40qq.com','password=1','passwordConfirm=1']
                        .forEach((item)=>{
                            // item.split('=')  ['email','1%40qq.com']
                            // decodeURIComponent   (%40 --> @)
                            userMessage[item.split('=')[0]] = decodeURIComponent(item.split('=')[1]);
                        })

                    let userDB = fs.readFileSync('./db.json','utf8');
                    try{
                        userDB = JSON.parse(userDB);
                    }catch(e){
                        userDB = [];
                    }

                    let isExist = false;
                    for(let i = 0;i<userDB.length;i++){
                        if(userDB[i].email === userMessage.email){
                            isExist = true;
                            break;
                        }
                    }
                    // 如果用户存在
                    if(isExist){
                        response.statusCode = 400;
                        response.setHeader('Content-Type','application/json;charset=utf-8');
                        response.write(`
                            {
                                "errors":{
                                    "error":"userAlreadyExist"
                                }
                            }
                        `)
                    }else{
                        userDB.push(
                            {
                                'email':userMessage.email,
                                'password':userMessage.password
                            }
                        );
                        let userDBString = JSON.stringify(userDB);
                        fs.writeFileSync('./db.json',userDBString);
                        response.statusCode = 200;
                    }
                    response.end();
                }
            )
    }

    // get 请求 login 界面
    if(path === '/login' && method === 'GET'){
        response.statusCode = 200;
        let string = fs.readFileSync('./login.html','utf8');
        response.setHeader('Content-Type','text/html;charset=uf-8');
        response.write(string);
        response.end();
    }

    // post login 数据验证
    if(path === '/login' && method === 'POST'){
        readPostData(request)
            .then((body)=>{
                let userMessage = {};
                body.split('&') // ['email=1%40qq.com','password=1']
                    .forEach((item)=>{
                        // item.split('=')  ['email','1%40qq.com']
                        userMessage[item.split('=')[0]] = decodeURIComponent(item.split('=')[1]);
                    })

                let userDB = fs.readFileSync('./db.json','utf8');
                try{
                    userDB = JSON.parse(userDB);
                }catch(e){
                    userDB = [];
                }

                let isEmailMatch = false;
                let isPasswordMatch = false;
                for(let i = 0;i<userDB.length;i++){

                    if(userDB[i].email === userMessage.email){
                        isEmailMatch = true;
                    }

                    if(userDB[i].email === userMessage.email && userDB[i].password === userMessage.password){
                        isEmailMatch = true;
                        isPasswordMatch = true;
                        break;
                    }
                }
                if(isEmailMatch && isPasswordMatch){
                    // add Session
                    // [`mysite_email=${userMessage.email};Max-Age=300;`,`mysite_password=${userMessage.password};Max-Age=300;`]
                    let sessionId = Math.random();
                    mySession[`${sessionId}`] = {'mysite_email':userMessage.email,'mysite_password':userMessage.password};

                    response.setHeader('Set-Cookie',`sessionId=${sessionId}`);
                    response.statusCode = 200;
                }else if(isEmailMatch && !isPasswordMatch){

                    //  错误代码 401 : 未授权,登陆失败
                    response.statusCode = 401;
                    response.setHeader('Content-Type','application/json;charset=utf-8');
                    response.write(`
                        {
                            "errors":{
                                "error":"passwordWrong"
                            }
                        }
                    `);
                }else if (!isEmailMatch){
                    response.statusCode = 401;
                    response.setHeader('Content-Type','application/json;charset=utf-8');
                    response.write(`
                        {
                            "errors":{
                                "error":"notRegister"
                            }
                        }
                    `);
                }
                response.end();
            })
    }
    // index.html
    if(path === '/'){

        let string = fs.readFileSync('./index.html','utf8');
        //  如果请求头中 携带 cookie 信息
        if(request.headers.cookie){
            let hash = {};
            request.headers.cookie.split('; ') .forEach((item)=>{ // item => sessionId=2134213412412
                                                                if(item.split('=')[0] === 'sessionId' && mySession[item.split('=')[1]]){
                                                                    hash['mysite_email'] = mySession[item.split('=')[1]].mysite_email;
                                                                    hash['mysite_password'] = mySession[item.split('=')[1]].mysite_password;
                                                                }
                                                            });
            let userDB = fs.readFileSync('./db.json','utf8');
            try{
                userDB = JSON.parse(userDB);
            }catch(e){
                userDB = [];
            }

            let isCookieMatch = false;
            for(let i=0;i<userDB.length;i++){
                if(userDB[i].email === hash.mysite_email && userDB[i].password === hash.mysite_password){
                    isCookieMatch = true;
                }
            }
            if(isCookieMatch){
                string = string.replace('__email__',hash.mysite_email);
                string = string.replace('__password__',hash.mysite_password);
            }else{
                string = string.replace('__email__','傻屌');
                string = string.replace('__password__','傻屌');
            }
        }else{
            string = string.replace('__email__','傻屌');
            string = string.replace('__password__','傻屌');
        }
        response.statusCode = 200;
        response.setHeader('Content-Type','text/html;charset=utf-8');
        response.write(string);
        response.end();
    }
    if(path === '/main.js'){
        let string = fs.readFileSync('./main.js','utf8');
        response.setHeader('Content-Type','application/javascript;charset=utf-8');
        // response.setHeader('Cache-Control','max-age=31536000');
        // md5 ETag 缓存
        let fileMD5 = md5(string);
        response.setHeader('ETag',fileMD5);
        if(request.headers['if-none-match'] === fileMD5){
            // 304: not modified
            response.statusCode = 304;
        }else{
            response.statusCode = 200;
            response.write(string);
        }
        // response.statusCode = 200;
        // response.write(string);
        response.end();
    }
})

// listen方法用于启动服务器
server.listen(port);
console.log('Listen'+port+'Success');
console.log('URL: http://localhost:'+port);

// Stack overflow : How to process POST  data in Node.js
// Node.js处理 前端 Post data 的方法
function readPostData(request){
    return new Promise((resovle,reject)=>{
        let body = [];
        request.on('data',(chunk)=>{
            body.push(chunk);
        }).on('end',()=>{
            body = Buffer.concat(body).toString();
            resovle(body);
        })
    })
}
