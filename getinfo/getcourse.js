var cheerio = require('cheerio');
var fs = require('fs');
var superagent = require('superagent-charset');
var Promise = require('bluebird');
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
var cnt = 0;
var cnt1 = 0;

var s = new Date();
var agentLogStream = fs.createWriteStream('./log/agent.log');
var mdbLogStream = fs.createWriteStream('./log/mdb.log');
var failedLogStream = fs.createWriteStream('./log/failed.log');

//getClazz().then(dosm);

var term = '2016.1';
var stuQueryStr = 'http://jwc.ecjtu.jx.cn:8080/jwcmis/stuquery.jsp';
var courseQueryStr = 'http://jwc.ecjtu.jx.cn:8080/jwcmis/classroom/class.jsp';

Clazz.find({}, null, {
	limit: 10
}).exec().then(function(Clazzes) {
	//console.log(Clazzes);

	// getInfo_P(courseQueryStr, 'term=' + term + '&banji=' + Clazzes._id, Clazzes, 0)
	// 	.then(convertCourses, agentLog).then(mdbLog, mdbLog).catch(failedLog);
	//var i = 0;

	Clazzes.forEach(function(elem, index, array) {
		//console.log(index);

		//	if (index >= 10) return;

		setTimeout(function() {
			getInfo_P(courseQueryStr, 'term=' + term + '&banji=' + elem._id, elem, 0)
				.then(convertCourses, agentLog).then(mdbLog, mdbLog).catch(failedLog);
		}, index * 500);
	});

	//i += 100;

	for (var i = 0; i < 50; ++i) {

		setTimeout(function() {
			console.log(cnt + '\t\t' + cnt1);
			//console.log(keepaliveAgent.unusedSockets);
		}, i * 1000);
	}
	//i += 10000;


});


function convertCourses(arg) {
	agentLog('converting Courses of \'' + arg.info._id + '\' now');
	return new Promise(function(resolve, reject) {
		var courses = [];

		var $ = cheerio.load(arg.text.replace(/&nbsp;/g, ''), {
			decodeEntities: false
		});

		$('table').first().attr('id', 't2');

		var i = 1,
			j = 1;
		for (i = 1; i <= 5; i++) {
			for (j = 1; j <= 7; j++) {
				var v = $('#t2 tr').eq(i).find('td').eq(j).find('font').html();
				if (v === '') continue;


				var s = v.split('<br>');

				//console.log(s);


				if (s[3]) {

					var sb1 = s[4].split(' ');
					var sb2 = s[5].split(' ');
					var lb = sb2[0].split('-');

					var courseb = {
							name: s[3].trim(),
							teacher: sb1[0],
							room: sb1[1],
							row: i,
							colume: j,
							rowspan: parseInt((sb2[1].length + 1) / 2),
							enable: sb2[0].toAry(),
						}
						//console.log(courseb);
					courses.push(courseb);
				}


				var sa1 = s[1].split(' ');
				var sa2 = s[2].split(' ');
				var la = sa2[0].split('-');



				var course = {
						name: s[0].trim(),
						teacher: sa1[0],
						room: sa1[1],
						row: i,
						colume: j,
						rowspan: parseInt((sa2[1].length + 1) / 2),
						enable: sa2[0].toAry(),
					}
					//console.log(course);
				courses.push(course);
			}
		}

		//	console.log(courses);


		arg.info.course = courses;
		arg.info.save(function(err) {
			if (err) {
				reject(err.toString() + " when save Course: \'" + arg.info._id + "\' ");
				failedLogStream.write(err.toString() + " when save Course: \'" + arg.info._id + "\' \n");
			}
			resolve("save Course: \'" + arg.info._id + "\' success");
		});

		agentLog('convertCourses of \'' + arg.info._id + '\' done');

		getInfo_P(stuQueryStr, 'banji=' + arg.info._id, arg.info._id, 0)
			.then(convertStu, agentLog)
			.then(agentLog, failedLog).catch(failedLog);

	});
}

var tt = 4;

function getInfo_P(querystr, argv, info, tx) {
	//info.timex = 0;
	//console.log("Now  get " + argv + '\'' + tx + '\' times');
	return new Promise(function(resolve, reject) {
		superagent.post(querystr)
			.send(argv)
			.retry(5)
		//.agent(keepaliveAgent)
		.timeout(1000)
			.charset('gb2312')
			.end(function(err, res) {
				if (err) {
					if (tx > tt) {
						failedLog('failed when get ' + argv + '\'' + tx + '\' times');
					} else {
						//setTimeout(function() {
						//process.nextTick(function() {
						getInfo_P(querystr, argv, info, tx + 1);
					}
					reject(err.toString() + " when getInfo of \'" + argv + "\' " + tx + " times ");
					return;
				}
				//console.log("Done get " + argv + '\'' + tx + '\'     ');
				resolve({
					text: res.text,
					info: info //===null?null:info
				});
				agentLog('getInfo of \'' + argv + '\' done');
			});
	});
}

function convertStu(arg) {
	//agentLog('getStu of \'' + arg.info + '\' done');
	return new Promise(function(resolve, reject) {
		//cnt1++;

		var $ = cheerio.load(arg.text, {
			decodeEntities: false
		});
		cnt += $('table tr').length;

		$('table tr').each(function(i, elem) {
			if (i == 0) return;
			var z = $(elem).find('td');
			var stu = new Stu({
				_id: z.eq(3).text(),
				name: z.eq(1).text(),
				clazz: arg.info,
				state: z.eq(4).text()
			});
			//console.log(stu);
			//cnt++;
			//console.log(i);

			stu.save(function(err) {
				if (err) {
					//	console.log(stu._id);
					//reject(err.toString() + " when save stu: \'" + stu._id + "\' ");
					failedLog(err.toString() + " when save stu: \'" + stu._id + "\' ");
				}
				//console.log(stu._id);
				mdbLog("save stu: \'" + stu._id + "\' success");
			});
		});
		resolve('convertStu of \'' + arg.info + '\' done');
	});
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


function agentLog(msg) {
	agentLogStream.write(msg + '\t' + new Date().Format() + '\n');
	//console.log(msg + '\t\t' + new Date().Format());
}

function mdbLog(msg) {
	mdbLogStream.write(msg + '\t' + new Date().Format() + '\n');
	//console.log(msg + '\t\t' + new Date().Format());
}

function failedLog(msg) {
	failedLogStream.write(msg + '\t' + new Date().Format() + '\n');
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