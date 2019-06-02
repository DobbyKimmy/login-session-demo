# login-session-demo
> 并非真实项目案例，仅为我的学习笔记，仅供学习参考



## Cookie简介
#### 为什么有cookie
以下内容摘自维基百科：
````
为什么有Cookie?
因为HTTP协议是无状态的，即服务器不知道用户上一次做了什么，这严重阻碍了交互式Web应用程序的实现。
在典型的网上购物场景中，用户浏览了几个页面，买了一盒饼干和两瓶饮料。
最后结帐时，由于HTTP的无状态性，不通过额外的手段，服务器并不知道用户到底买了什么。
所以Cookie就是用来绕开HTTP的无状态性的“额外手段”之一。
服务器可以设置或读取Cookies中包含信息，借此维护用户跟服务器会话中的状态。

在刚才的购物场景中，当用户选购了第一项商品，服务器在向用户发送网页的同时，还发送了一段Cookie，记录着那项商品的信息。
当用户访问另一个页面，浏览器会把Cookie发送给服务器，于是服务器知道他之前选购了什么。
用户继续选购饮料，服务器就在原来那段Cookie里追加新的商品信息。
结帐时，服务器读取发送来的Cookie就行了。

Cookie另一个典型的应用是当登录一个网站时，网站往往会请求用户输入用户名和密码，并且用户可以勾选“下次自动登录”。
如果勾选了，那么下次访问同一网站时，用户会发现没输入用户名和密码就已经登录了。
这正是因为前一次登录时，服务器发送了包含登录凭据（用户名加密码的某种加密形式）的Cookie到用户的硬盘上。
第二次登录时，如果该Cookie尚未到期，浏览器会发送该Cookie，服务器验证凭据，于是不必输入用户名和密码就让用户登录了。
````
以上内容是维基百科对Cookie的解释,为什么有Cookie? 说白了： 因为浏览器与人需要一种交互，Cookie则实现了这种交互;服务器通过向用户发送Cookie给予了用户某种“权限”,这好比是一张门票,当浏览器携带着“门票”向服务器发起请求时,服务器通过验证“门票”信息就可以赋予用户某种“权限”。接下来我用注册与登陆的示例来简单地介绍下 Cookie的具体应用场景。

## 注册登陆
[代码链接](https://github.com/DobbyKimmy/login-cookie-demo)
<br>

本案例中，注册登陆做的并不全面,但是基本思想和真实的注册登陆还算吻合。案例中并没有真实的数据库，而是使用了json文件充当数据库,json文件中仅有一个数组，用来存储用户的信息。当用户注册成功后,则将用户的账号密码存储到我们的"数据库"中,在此之前需要通过前端校验代码以及后端的校验代码,本案例中仅有前端的校验,而后端校验代码并没有在案例中展示。在校验成功时，页面会由注册界面自动跳转到登陆界面,并且用户的信息会被添加到json文件中，如果用户再次使用相同的邮箱进行注册时,界面则会提示“用户已存在”的信息。示例效果如下：
<br>

![](https://user-gold-cdn.xitu.io/2019/6/2/16b171d49b5ba58f?w=416&h=333&f=png&s=13035)
<br>
如果注册成功,json文件中则会新增用户的信息：
<br>

![](https://user-gold-cdn.xitu.io/2019/6/2/16b171f23aed7d48?w=448&h=27&f=png&s=4756)
<br>
再次使用该邮箱进行注册时:
<br>

![](https://user-gold-cdn.xitu.io/2019/6/2/16b17211cfb735e6?w=414&h=331&f=png&s=13741)
<br>
跳转到登陆界面后,如果用户输入的邮箱及密码与数据库的数据信息匹配，则登陆成功，页面会跳转至index页面，同时服务器会在返回给客户端的响应头中添加cookie,在cookie中存入了用户的信息：
````
if(isEmailMatch && isPasswordMatch){
    response.setHeader('Set-Cookie',[`mysite_email=${userMessage.email};Max-Age=300;HttpOnly`,`mysite_password=${userMessage.password};Max-Age=300;HttpOnly`]);
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
````
本段代码中如果用户登陆的邮箱及密码均正确则服务器会在响应头中“Set-Cookie”,本示例中演示了如何设置多个cookie的方法即即：
````
response.setHeader('Set-Cookie',['cookieName1=val1','cookieName2=val2']);
````
同时在Set-Cookie中 Max-Age代表在 cookie 失效之前需要经过的秒数;设置了 HttpOnly 属性的 cookie 不能使用 JavaScript 经由  Document.cookie 属性、XMLHttpRequest 和  Request APIs 进行访问，以防范跨站脚本攻击（XSS）。如果需要了解具体详细的Set-Cookie设置信息可以参考 MDN的[Set-Cookie](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie)。
在代码中，我也做出了一些最简单的后台判断,例如邮箱输入正确但密码输入错误时,服务器reponse一个json格式的数据流，前端代码通过判断会将错误信息反馈至页面上，部分代码如下：
````
// ajax post
$.post('/login',userMessage)
    .then(
        // success
        ()=>{
        // 跳转至 index 页面
        window.location.href = '/'
        },
        // fail
        (request)=>{
            let errorMessage = request.responseJSON.errors.error;
                        
            if(errorMessage === 'passwordWrong'){
                errorText("password","密码错误");
                return
            }else if(errorMessage === 'notRegister'){
                errorText("email","无此用户信息");
                return
            }
        }
    )
````
具体的效果如下：
<br>
密码错误：
<br>

![](https://user-gold-cdn.xitu.io/2019/6/2/16b1738852a3ea5d?w=414&h=275&f=png&s=12081)
<br>
无此用户信息：
<br>

![](https://user-gold-cdn.xitu.io/2019/6/2/16b1739e2f5070e8?w=415&h=276&f=png&s=11680)
<br>
在登陆成功后，跳转至index主页,当浏览器向服务器发起get请求获取主页时,因为浏览器中携带了同域名的cookie信息，也就是携带了"入场票据",在服务器检查了"票据"后，响应给用户一个经处理过的页面:
<br>

![](https://user-gold-cdn.xitu.io/2019/6/2/16b1741a112e0e12?w=587&h=229&f=png&s=23905)
<br>
如果我们在未携带cookie信息访问index页面时，则会获取到这样的内容~
<br>

![](https://user-gold-cdn.xitu.io/2019/6/2/16b175b524ec301f?w=413&h=254&f=png&s=19725)
<br>
在点击退出登陆后，页面会跳转到login页面,同时也会清除cookie的信息,当然我们需要**先将后台代码的 Set-Cookie中的HttpOnly删除掉！！** 如果不将HttpOnly删除，那么我们是无法调用document.cookie的~ 退出登陆button事件的代码如下：
````
// 退出登陆时清空 cookie
$('#clearCookie').on('click',()=>{
    deleteCookie('mysite_password');
    deleteCookie('mysite_email');
    window.location.href = '/login';
})
function deleteCookie (name){
    // 设置让 cookie 无效的方法 让cookie的期限 expires 为 现在
    document.cookie = name + '=; expires='+new Date().toGMTString();
}
````
我们看到了Cookie在注册登陆中的作用，当用户携带着某域名可以识别的Cookie时,服务器就可以通过用户的"票据"返回给用户不同的页面，如果我们未注册登陆直接访问 index主页,获得到的信息与携带Cookie访问主页时获得的信息是截然不同的。这就是Cookie应用最多的一个场景，但是这样做实际上也是有问题的，用户完全可以仿造Cookie,只要用户有一点点的HTTP知识，修改Cookie伪造用户是完全可以的，这就难免带来了安全问题。
## Session
[代码链接](https://github.com/DobbyKimmy/login-session-demo)
<br>

Cookie带来的问题就是安全问题，它可以被任意地修改和伪造，于是Session就出现了，在说明什么是Session之前，我们先试图去改进代码带来的安全性问题：
<br>
首先在 server.js 中 声明一个全局变量 mySession
````
var mySession = {};
````
在用户登陆成功之后,传给用户的cookie就不是用户的信息了,我们传给用户一个sessionId,sessionId的值是一个随机数：
````
if(isEmailMatch && isPasswordMatch){
    // add Session
    let sessionId = Math.random();
    mySession[`${sessionId}`] = {'mysite_email':userMessage.email,'mysite_password':userMessage.password};

    response.setHeader('Set-Cookie',`sessionId=${sessionId}`);
    response.statusCode = 200;
}
````
当用户访问index首页时,我们需要对用户cookie中 sessionId的值进行判断：
````
if(path === '/'){
    let string = fs.readFileSync('./index.html','utf8');
    //  如果请求头中 携带 cookie 信息
    if(request.headers.cookie){
    let hash = {};
    request.headers.cookie.split('; ') .forEach((item)=>{ 
        if(item.split('=')[0] === 'sessionId' && mySession[item.split('=')[1]]){
            hash['mysite_email'] = mySession[item.split('=')[1]].mysite_email;
            hash['mysite_password'] = mySession[item.split('=')[1]].mysite_password;
        }
    });
    ... ...
}
````
我们仅仅修改了几行代码，cookie中不再存入用户的隐私信息而是改为了sessionId 而sessionId对应的value是一串随机数，后台代码只需要验证这串随机数即可，这样依赖即便用户拥有修改cookie的能力，也无能为力,因为cookie存储在客户端，而session存储的隐私信息都是在服务器上的。cookie携带的"票证"仅仅是sessionId，服务器则是通过cookie携带的sessionId 来进行判断的。我们来总结下：
````
Cookie：
1. 服务器通过Response-Header 的 Set-Cookie给客户端一串字符串
2. 客户端每次访问相同域名的网页时,带上这串字符串，服务器可以通过这串字符串去读取客户端的信息
3. 客户端要在一段时间内保存这个Cookie
4. Cookie默认在用户关闭页面后就会失效，但是后台代码可以任意设置Cookie的过期时间

Session:
1. 将SessionId通过Cookie发给客户端
2. 客户端访问服务器时，服务器读取SessionId
3. 服务器有一块内存保存了所有的Session
4. 通过SessionId可以得到对应用户的隐私信息
5. 这块内存就是服务器上的所有session

Session与Cookie的联系与区别：
1. Session是依赖于Cookie实现的
2. Cookie存储在客户端，Session则存储在服务器上

````
## LocalStorage与 SessionStorage
现在假设我们的网站更新了,需要在首页提示用户更新的内容。我们只需要很简单的代码就可以实现这一项功能：
````
// update message
alert('我们的网站更新啦~更新的内容有：...');
````
但是，从用户体验上来讲，用户只希望能被提醒一次，有什么方法可以做到呢？答案就是LocalStorage。MDN: [LocalStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage).
<br>
与LocalStorage相似的是SessionStorage。二者的区别是：存储在 localStorage 的数据可以长期保留；而当页面会话结束——也就是说，当页面被关闭时，存储在 sessionStorage 的数据会被清除 。以下是MDN LocalStorage的示例：
1. setItem
    ````
    localStorage.setItem('myCat', 'Tom');
    ````
2. getItem
    ````
    let cat = localStorage.getItem('myCat');
    ````
3. removeItem
    ````
    localStorage.removeItem('myCat');
    ````
4. clear
    ````
    // 移除所有
    localStorage.clear();
    ````
我们使用LocalStorage对本案例的更新提示功能做一个优化：
````
 // update message
let already = localStorage.getItem('already',true);
if(!already){
    let updateMessage = localStorage.setItem('already',true);
    alert('我们的网站更新啦~更新的内容有：...');
}
````
这样一来,就能保证每个用户都看到更新提示，且更新提示只出现了一次。
<br>
LocalStorage 及 SessionStorage 总结:
````
LocalStorage:
1. LocalStorage 同 HTTP无关
2. HTTP不会带上LocalStorage的值
3. 只有相同域名的页面才能互相读取LocalStorage(没有同源策略那么严格)
4. 每个域名的LocalStorage 最大存储量 为 5Mb左右
5. 常用场景：记录有没有提示过用户
6. LocalStorage 永久有效，除非主动清除数据

SessionStorage与LocalStorage的区别：
1. SessionStorage在关闭页面后(会话结束)就会失效
2. LocalStorage则永久有效(除非用户自己清除)

Cookie与LocalStorage的区别：
1. LocalStorage和HTTP无关,Cookie则是服务器在
响应头中设置了Set-Cookie后传给浏览器，每次浏览器访问
服务器都要带上Cookie
2. Cookie的存储量一般有4kb LocalStorage则有 5mb左右
````
## Cache-Control 与 ETag

MDN: [Cache-Control](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control)
<br>
Cache-Control可以对用户体验进行优化~ 假设我这个项目用到了Vue,（事实上我将Vue.js代码下载到了main.js当中，并且在node.js中新增了/main.js的路由，并在index页面中的script标签中引入了main.js）,试想一下，用户每次刷新页面都会去向服务器发起请求 main.js这个文件 。在我的电脑上,请求的时间大约为：
<br>

![](https://user-gold-cdn.xitu.io/2019/6/2/16b18219150d0e39?w=209&h=25&f=png&s=1117)
<br>
一个文件请求到下载则需要13ms的时间，试想一下当有多个文件需要下载时,时间必然更为长久，那么有什么办法可以进行优化呢？首先可以使用Cache-Control。
````
if(path === '/main.js'){
    let string = fs.readFileSync('./main.js','utf8');
    response.setHeader('Content-Type','application/javascript;charset=utf-8');
    response.setHeader('Cache-Control','max-age=31536000'); // 设置缓存时间为1年
    response.statusCode = 200;
    response.write(string);
    response.end();
}
````
在/main.js的路由下，我们添加了这一行代码：
````
response.setHeader('Cache-Control','max-age=31536000');
````
当我们再次刷新页面时：
<br>

![](https://user-gold-cdn.xitu.io/2019/6/3/16b18f5e1c6b7d9f?w=281&h=28&f=png&s=1916)
<br>
可以看到在开发者工具的文件大小这一栏下：原本369KB的文件变为了"from memor cache"的字样,而时间则由原本的13ms变为了0 ms。这是因为，在第一次请求时main.js这个文件时，main.js已经被客户端的本地缓存了,当用户向index页面发其请求时,浏览器因为已经缓存了main.js这个文件,所以就不会再向服务器发起main.js文件的请求。那么问题来了，我虽然设置了``response.setHeader('Cache-Control','max-age=31536000');``这行代码,并且用户可以缓存文件一年之久,但是如果我在中途更新了文件,用户怎么才能请求到呢？其实很简单,我们只需要再index的script标签的src中添加query参数即可：
````
 <script src="./main.js?version=2"></script>
````
这样一来，每当我们的 main.js 文件更新需要用户进行下载的时候，我们在src的path后面使用query参数指定版本号即可。除了可以使用Cache-Control外，我们还可以使用ETag来进行优化,那么什么是ETag呢？MDN的解释如下：
````
ETagHTTP响应头是资源的特定版本的标识符。
这可以让缓存更高效，并节省带宽，因为如果内容没有改变，Web服务器不需要发送完整的响应。
而如果内容发生了变化，使用ETag有助于防止资源的同时更新相互覆盖（“空中碰撞”）。
````
在了解到底什么是ETag之前，我们首先需要了解下 md5 消息摘要算法。使用``npm install md5`` 下载md5后，在node.js中添加MD5模块后我们就可以使用md5了，在文件中添加：``var md5 = require('md5');``即可。首先，先简单了解下md5的应用场景,MDN的解释如下：MD5已经广泛使用在为文件传输提供一定的可靠性方面。例如，服务器预先提供一个MD5校验和，用户下载完文件以后，用MD5算法计算下载文件的MD5校验和，然后通过检查这两个校验和是否一致，就能判断下载的文件是否出错。说白了md5的本质是用来检测文件下载是否一致的，当文件出现了丝毫的变动,通过md5算法得到的字符串也会出现很大的差异。示例代码如下：
````
if(path === '/main.js'){
    let string = fs.readFileSync('./main.js','utf8');
    response.setHeader('Content-Type','application/javascript;charset=utf-8');
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
        response.end();
    }
````
首先我们将fs.readFileSync读取的文件字符串通过md5算法变成一个字符串长串，在响应头中设置了``response.setHeader('ETag',fileMD5);``,浏览器的请求头中会带有'if-none-match'这样一个属性，它的内容与示例中的fileMD5内容是一样的。第一次用户向服务器发起请求：
<br>

![](https://user-gold-cdn.xitu.io/2019/6/3/16b19540a836929f?w=206&h=32&f=png&s=1270)
<br>
main.js文件大小为 366KB，请求到下载完成的时间为119ms,好，我们刷新页面：
<br>

![](https://user-gold-cdn.xitu.io/2019/6/3/16b1955ae1f1dd1b?w=210&h=34&f=png&s=1205)
<br>
在main.js文件未改动的情况下，大小变为了182B，并且时间上也有了显著的缩短。仔细想一想程序所作的事情：如果文件未发生变动 那么就向用户发送 304 即 not modified ;反之 则将 改动的文件响应给用户。那么看到这里，想必你已经知道了Cache-Control与ETag的缓存有什么区别了；我的总结如下：
````
如：response.setHeader('Cache-Control','max-age=31536000'); 
    的含义是请求到文件后，将文件缓存1年，当用户刷新页面时浏览器则不会再向
    服务器发起请求
对于 ETag的缓存则是：
    浏览器会向服务器发起请求，但服务器则会判断
    如果服务器发现要响应给浏览器的内容的md5字符串与request.headers['if-none-match']
    相等则说明服务器之前响应给用户的文件信息是一致的,如果不相等
    则说明需要重新响应给用户
    浏览器还是会向服务器发起请求,但服务器不一定会响应给浏览器

````


文章结束~感谢您的耐心阅读，如果有错误，还望批评指出。









