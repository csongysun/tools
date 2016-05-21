var cheerio = require('cheerio');
var fs = require('fs');
var superagent = require('superagent-charset');


var agentLogStream = fs.createWriteStream('./logclsid/agent.log');
var mdbLogStream = fs.createWriteStream('./logclsid/mdb.log');
var failedLogStream = fs.createWriteStream('./log/failed.log');


var tt = 5;

superagent.get('http://jwc.ecjtu.jx.cn:8080/jwcmis/stuquery.jsp')
	.charset("gb2312")
	.timeout(5000)
	.end(function(err, sres) {
		if (err) {
			return console.log(err);;
		}
		console.log("got d");
		cvtDepart(sres.text)
	});

function cvtDepart(text) {
	var $ = cheerio.load(text, {
		decodeEntities: false
	});
	var $z = $('select[name=depart]').children();
	var flag = true;
	$z.each(function(i, elem) {
		if ($(elem).val() == '08' && flag) {
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

			getClazz(arg.id, arg.name, arg.nianji, 0);

			nianji++;
		}
	});
}

function getClazz(depart, departname, nianji, tx) {
	superagent.post('http://jwc.ecjtu.jx.cn:8080/jwcmis/stuquery.jsp')
		.send('depart=' + depart + '&nianji=' + nianji)
		.charset("gb2312")
		.timeout(5000)
		.end(function(err, sres) {
			if (err) {
				if (tx > tt) {
					failedLog('failed when get ' + depart + '\'' + tx + '\' times, [give up]');
				} else {
					getClazz(depart, departname, nianji, tx + 1);
					failedLog('failed when get ' + depart + '\'' + tx + '\' times');
				}
				return;
			}

			agentLog('Depart:\t' + depart + 'departname:\t' + departname);

			cvtClazz(sres.text, departname);

			
		});
}

function cvtClazz(text, departname) {
	var $ = cheerio.load(text, {
		decodeEntities: false
	});
	var $z = $('select[name=banji]').children();
	$z.each(function(i, elem) {
		if (i === 0) return;
		var clazz = {
			_id: $(elem).val(),
			name: $(elem).text(),
			depart: departname,
			course: null
		}

		mdbLog('Classid: ' + clazz._id);

		//	addClazz(clazz).then(mdbLog).catch(mdbLog);
	});
}



function agentLog(msg) {
	agentLogStream.write(msg + '\t' + new Date().Format() + '\n');
	console.log(msg + '\t\t' + new Date().Format());
}

function mdbLog(msg) {
	mdbLogStream.write(msg + '\t' + new Date().Format() + '\n');
	//console.log(msg + '\t\t' + new Date().Format());
}

function failedLog(msg) {
	failedLogStream.write(msg + '\t' + new Date().Format() + '\n');
	console.log(msg + '\t\t' + new Date().Format());
}

Date.prototype.Format = function() { //author: meizz 
	var fmt = "yyyy-MM-dd hh:mm:ss";
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}