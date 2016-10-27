module.exports = [{
	url: "/test", //代理请求，返回json数据
	res: {
		errorMessage: "success",
		"data": {}
	}
}, {
	url: "http://test.js", //代理线上文件，返回本地相对路径文件
	res: './test.js'
}, {
	url: "http://test.js", //代理线上文件，返回本地绝对路径文件
	res: '/Users/Desktop/test.js'
}, {
	url: "http://test.js", //代理线上文件，返回普通字符串
	res: 'test'
}]