var cheerio = require('cheerio');
var fs = require('fs');
var superagent = require('superagent-charset');
//var Promise = require('bluebird');
require('superagent-retry')(superagent);

var Clazz = require('./models/index.js').Clazz;
var Course = require('./models/index.js').Course;
var Stu = require('./models/index.js').Stu

var Agent = require('agentkeepalive');

var keepaliveAgent = new Agent({
	maxSockets: 100,
	maxFreeSockets: 10,
	timeout: 10,
	keepAliveTimeout: 5 // free socket keepalive for 30 seconds
});

var i = 0;
var limit = 1000;
var start = i * limit;


var s = new Date();
var agentLogStream = fs.createWriteStream('./logtest/agent' + start + '.log');
var mdbLogStream = fs.createWriteStream('./logtest/mdb' + start + '.log');
var failedLogStream = fs.createWriteStream('./logtest/failed' + start + '.log');

//getClazz().then(dosm);

var term = '2015.2';
var stuQueryStr = 'http://jwc.ecjtu.jx.cn:8080/jwcmis/stuquery.jsp';
var courseQueryStr = 'http://jwc.ecjtu.jx.cn:8080/jwcmis/classroom/class.jsp';

var tt = 10;

// Clazz.findById('201321100703', function(err, elem) {
// 	//console.log(elem);
// 	getCourse(elem, 0);
// });

Clazz.find().skip(start).limit(limit).exec().then(function(Clazzes) {
	Clazzes.forEach(function(elem, index, array) {
		//agentLog(elem._id);
	//	console.log(elem);
		getCourse(elem, 0);
	});
});

function getCourse(elem, tx) {

	superagent.post(courseQueryStr)
		.send('term=' + term + '&banji=' + elem._id)
		.charset('gb2312')
		.timeout(5000)
		.end(function(err, res) {
			//	console.log("aa");
			if (err) {
				if (tx > tt) {
					failedLog('failed when get ' + elem._id + '\'' + tx + '\' times, [give up]');
				} else {
					getCourse(elem, tx + 1);
					failedLog('failed when get ' + elem._id + '\'' + tx + '\' times');
				}
				return;
			}
			//console.log(courseQueryStr);
			agentLog('Course:\t' + elem._id);
			cvtCourse(res.text, elem);
		});
}

function cvtCourse(text, clazz) {
	var courses = [];
	//clazz.course = [];
	//console.log(text);

	var $ = cheerio.load(text.replace(/&nbsp;/g, ''), {
		decodeEntities: false
	});

	$('table').first().attr('id', 't2');

	var i = 1,
		j = 1;

	var kb = [];
	for (i = 1; i <= 5; i++) {
		var line = [];
		for (j = 1; j <= 7; j++) {
			var v = $('#t2 tr').eq(i).find('td').eq(j).find('font').html().replace(/<br>/g, '\n');
			line.push(v);
		}
		kb.push(line);
	}

	//console.log(kb);


	//clazz.course = null;
	clazz.course = kb;
//	console.log(clazz.course);
	clazz.save(function(err) {
		if (err) {
			failedLog(err.toString() + " when save Course: \'" + clazz._id + "\' \n");
		}
		mdbLog("save Course: \'" + clazz._id + "\' success");
	});

	process.nextTick(function() {
	getStu(clazz._id, 0);
	});

	//agentLog('convertCourses of \'' + arg.info._id + '\' done');

	// getInfo_P(stuQueryStr, 'banji=' + arg.info._id, arg.info._id, 0)
	// 	.then(convertStu, agentLog)
	// 	.then(agentLog, failedLog).catch(failedLog);

}

String.prototype.toAry = function() {
	var f = -1;
	var s = this.toString();
	if (s.match('\[单\]')) {
		f = 1;
		s = s.replace('[单]', '');
	} else if (this.match('\[双\]')) {
		f = 0;
		s = s.replace('[双]', '');
	}

	//console.log(s);

	var ary = [];
	var strary = s.split(',');
	//console.log(strary);
	for (var str in strary) {
		//console.log(str);
		var numary = strary[str].split('-');
		//console.log(numary[0]);
		for (var i = Number(numary[0]); i <= Number(numary[1]); i++) {
			if (f === 1) {
				if (i % 2 !== 1) continue;
			}
			if (f === 0) {
				if (i % 2 !== 0) continue;
			}
			ary.push(i);
		}
	}
	//console.log(ary);
	return ary;
}

function getStu(cid, tx2) {
	superagent.post(stuQueryStr)
		.send('&banji=' + cid)
		.timeout(5000)
		.charset('gb2312')
		.end(function(err, res) {
			if (err) {
				if (tx2 > tt) {
					failedLog('failed when get stu of : \'' + cid + '\' ' + tx2 + '\' times, [give up]');
				} else {
					getStu(cid, tx2 + 1);
					failedLog('failed when get stu of : \'' + cid + '\' ' + tx2 + '\' times');
				}
				return;
			}
			agentLog('Stu:\t' + cid);
			cvtStu(res.text, cid);
		});
}

function cvtStu(text, cid) {

	var $ = cheerio.load(text, {
		decodeEntities: false
	});

	$('table tr').each(function(i, elem) {
		if (i == 0) return;
		var z = $(elem).find('td');
		var stu = new Stu({
			_id: z.eq(3).text(),
			name: z.eq(1).text(),
			clazz: cid,
			state: z.eq(4).text()
		});
		Stu.findById(stu._id, function(err, oldstu) {
			if (err) {
				failedLog(err.toString() + " when find stu: \'" + stu._id + "\' ");
			}
			if (!oldstu) {
				stu.save(function(err) {
					if (err) {
						failedLog(err.toString() + " when save stu: \'" + stu._id + "\' ");
					}
					mdbLog("save stu: \'" + stu._id + "\' success");
				});
			}
		})

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