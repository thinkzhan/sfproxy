##desc
   proxy file or request ,only for http

##usage
####1 全局
`npm install -g sfproxy`
```
sfproxy -l [file] -p [port] -t [timeout]
```

`浏览器应监听端口`

####2 引用
`npm install sfproxy`

```
require('sfproxy').run({
	list: 'sfproxy-config.js', // 相对于process.cwd
	port: 3037,
	timeout: 1000
});
```

`浏览器应监听端口`
##args

`-l --list: 代理配置文件路径，相对(相对于命令执行路径)或绝对路径`

`-p --port: 代理服务器端口，默认3037`

`－t --timeout: 请求响应超时时延`

## 代理配置文件格式
```
module.exports = [{
		url: "/user", //代理请求，返回json数据
		res: {
			errorMessage: "success",
			"data": {
			}
		}
	}, {
	 	url: "http://www/test.js", //代理线上文件，返回本地相对路径文件
	 	res: './test.js'
	}, {
		url: "http://www/test.js",  //代理线上文件，返回本地绝对路径文件
		res: '/Users/Desktop/test.js'
	}
]
```



