const charset = require('superagent-charset');
const request = require('superagent');
charset(request);
//var iconv = require('iconv-lite');
//var Promise = require('bluebird');
var cheerio = require('cheerio');


var studentid = '20132110070301';
var ecardpwd = '888888';

var code = "";
var host = 'http://172.16.7.1';
var cookies;

function main() {
    Home().then(Login).then(GetAccountInfo).then(GetTodayList).then().catch(function(msg){
        console.log(msg);
    });
};

function Home() {
    return new Promise(function (resolve, reject) {
        request.get(host + '/homeLogin.action')
            .end(function (err, res) {
                if (err) console.log(err);
                cookies = res.header['set-cookie'];
                console.log(cookies);
                resolve();
            })
    })
}

function Login() {
    return new Promise(function (resolve, reject) {
        request.post(host + '/loginstudent.action')
            .set({
                'User-agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
                'Cookie': cookies,
                'referer': host + '/homeLogin.action',
                'Content-Type': 'application/x-www-form-urlencoded'
            })
            .send({
                'name': studentid,
                'userType': '1',
                'passwd': ecardpwd,
                'loginType': "2",
                "rand": code,
                "imageField.x": "24",
                "imageField.y": "11"
            })
            .charset('gb2312')
            .end(function (err, res) {
                if (err) reject(err);
                // console.log(res.text);
                if(res.text.match('密码错误')||res.text.match('无此用户名称'))
                    reject('密码错误');
                resolve();
            })
    })
}

function GetAccountInfo() {
    return new Promise(function (resolve, reject) {
        request.get(host + '/accountcardUser.action')
            .set({
                'User-agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
                'Cookie': cook,
                'referer': host + '/homeLogin.action',
                'Content-Type': 'application/x-www-form-urlencoded'
            })
            // .charset('gb2312')
            .end(function (err, res) {
                if (err) console.log(err);
                //console.log(res.text);
                var $ = cheerio.load(res.text);
                var balancestr = $('td.neiwen').eq(-5).text();
                var balance = balancestr.match(/(\d{1,}\d*\.\d{2})元/g);
                //console.log(balance);
                var info = {
                    ecardid: $('td.neiwen').eq(3).text().trim(),
                    status: $('td.neiwen').eq(-9).text().trim(),
                    balance: balance[0],
                    recharge: balance[2]
                }
                //var info = $('td.neiwen').eq(-5).text();
                //console.log(info);
                resolve(info);
            })
    })
}

function GetTodayList(param) {
    return new Promise(function (reslove, reject) {
        request.post(host + '/accounttodatTrjnObject.action')
            .set({
                'User-agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
                'Cookie': cookies,
                'referer': host + '/homeLogin.action',
                'Content-Type': 'application/x-www-form-urlencoded'
            })
            .send({
                'account': param.ecardid,
                'inputObject': 'all',
                'Submit': ''
            })
            .charset('gb2312')
            .end(function (err, res) {
                if (err) reject(err);
                console.log(res.text);
                $ = cheerio.load(res.text);
                var info = $('tr.bl').eq(1).text().match(/(共涉及:\d{1,}次交易)[^;]*; (总交易额为:[-]?\d{1,}.\d{1,}（元）)/);
               // console.log(info[0]);
                var listjq = $('tr.listbg');
            })

    })
}

main();