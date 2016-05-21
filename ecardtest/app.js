const charset = require('superagent-charset');
const request = require('superagent');
charset(request);
var iconv = require('iconv-lite');
//var Promise = require('bluebird');


var studentid = '20132110070328';
var ecardpwd = '940906';

var code = "";
var host = 'http://172.16.7.1';
var cookies;

async function main () {
    await Home();
    await Login();
};

function Home() {
    return new Promise(function (resolve, reject) {
        request.get(host + '/homeLogin.action')
            .end(function (err, res) {
                if (err) console.log(err);
                cookies = res.header['set-cookie'];
                console.log(cookies);
                console.log(res.text);
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
            .end(function (err, sres) {
                if (err) reject(err);
                resolve();
            })
    })
}

main();