##desc
   proxy file or request ,only for http

##usage
####1 全局
`npm install -g sfproxy`
```
sfproxy -l [file] -p [port] -t [timeout]
```

`浏览器监听端口`

####2 引用
`npm install sfproxy`

```
require('sfproxy').init({
	list: {} || sfproxy-config.js
    port: 3037,
    timeout : 1000
});
```

`浏览器监听端口`
##args



