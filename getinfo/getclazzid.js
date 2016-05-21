var cheerio = require('cheerio');
var fs = require('fs');
var superagent = require('superagent-charset');
var Promise = require('bluebird');

var Clazz = require('./models/index.js').Clazz;


var s = new Date();
var agentLogStream = fs.createWriteStream('./log/agent.log');
var mdbLogStream = fs.createWriteStream('./log/mdb.log');

getDepart().then(convertDepart, agentLog).then(agentLog).catch(agentLog);

//Done
function getDepart() {
	console.log("begin to getDepart");
	var promise = new Promise(function(resolve, reject) {
		superagent.get('http://jwc.ecjtu.jx.cn:8080/jwcmis/stuquery.jsp')
			.charset("gb2312")
			.end(function(err, sres) {
				if (err) {
					reject("err in getDepart");
				}
				resolve(sres.text)
			});
	});
	return promise;
}

//Done
function convertDepart(text) {
	var promise = new Promise(function(resolve, reject) {
		var $ = cheerio.load(text, {
			decodeEntities: false
		});
		var $z = $('select[name=depart]').children();
		var flag = true;
		$z.each(function(i, elem) {
			if ($(elem).val() == '08' && flag){
				flag = false;
				return;
			}
			//console.log($(elem).val());
			var nianji = 2010
			while (nianji < 2015) {
				var arg = {
						id: $(elem).val(),
						name: $(elem).text(),
						nianji: nianji
					}
				//	console.log(nianji);
					//	console.log(arg.nianji + '	'+nianji);
				//	console.log(arg.id);
				getClazz(arg).then(convertCls, agentLog).then(agentLog).catch(agentLog);
				nianji++;
			}
		});
		resolve('convert ' + $z.length + ' Depart complete 	');
	});
	return promise;
}


///Done
function getClazz(arg) {
	var promise = new Promise(function(resolve, reject) {
		//console.log(arg);
		//console.log("depard=" + arg.id + "&nianji=" + arg.nianji);
		superagent.post('http://jwc.ecjtu.jx.cn:8080/jwcmis/stuquery.jsp')
			.send('depart=' + arg.id + '&nianji=' + arg.nianji.toString())
			.charset("gb2312")
			.end(function(err, sres) {
				if (err) {
					reject("err in getClazz	of " + arg.name + '	');
				}
			//	console.log("depart=" + arg.id + "&nianji=" + arg.nianji);

				//	console.log(arg.name + '	' + arg.nianji);
			//	console.log(sres.text);
				resolve({
					text: sres.text,
					departname: arg.name,
					nianji: arg.nianji
				});
			});
	});
	return promise;
}

function convertCls(arg) {
	//agentLog(text);
	//console.log(arg);
	var promise = new Promise(function(resolve, reject) {
		var clazz = [];
		var $ = cheerio.load(arg.text, {
			decodeEntities: false
		});
		var $z = $('select[name=banji]').children();
		//console.log(arg.departname);
	//	console.log($z.length);
		$z.each(function(i, elem) {
			if (i === 0) return;
			var clazz = {
					_id: $(elem).val(),
					name: $(elem).text(),
					depart: arg.departname,
					course: null
				}
				//	mdbLog(clazz._id);
				//	console.log(clazz._id);
			addClazz(clazz).then(mdbLog).catch(mdbLog);
		});
		//	console.log(departname);
		resolve('convert ' + $z.length + ' Cls of ' + arg.departname + '-' + arg.nianji + ' complete');
	});
	return promise;
}


function addClazz(clazz) {
	var promise = new Promise(function(resolve, reject) {
		var clazzEnitiy = new Clazz(clazz);
		clazzEnitiy.save(function(err) {
			if (err) {
				reject(err + 'when add Clazz' + clazz);
			}
			resolve('add clazz ' + clazz._id + ' done');
		});
	});
	return promise;
}

function agentLog(msg) {
	agentLogStream.write(msg + '\n');
	//	console.log(msg);
}

function mdbLog(msg) {
	mdbLogStream.write(msg + '\n');
	console.log(msg);
}