'use strict'

//--
var express = require('express');
var router = express.Router();
let Mongo=require('mongodb').MongoClient;
var qs = require('querystring');

//--
let driverStr='mongodb://localhost:27017/elecmapcheckin';
let cn='elecmapcheckin';//collectionName;

//router.get('/', function(req, res, next) {
//    //res.send('1');
//    //req.end();
//});

/**
 *execResult 0成功
 *execResult 1用户存在
 *execResult 2失败
 *
 */
router.post('/reg', function(req, res, next) {
    //console.log(req.body+" "+req.body);
    //console.log(req.body+" "+req.body.userid);
    var userId=req.body.userid;
    if (userId==undefined) {
        var errRet={};
        errRet.err="0";
        errRet.execResult="2";
        console.log(1);
        res.send(JSON.stringify(errRet));
        res.end();
        //db.close();
        return;
    }
    Mongo.connect(driverStr, function(err, db) {
        if (err) {
            console.log(2);
            console.log(err);
            db.close();
            return;
        }
        var co = require('co');
        co(function*() {
            console.log(3);
            var r=yield db.collection(cn).count({"userid":userId});
            if(r!=0){
                console.log(4);
                var errRet={};
                errRet.err="0";
                errRet.execResult="1";
                res.send(JSON.stringify(errRet));
                //res.send("{err:'0',execResult:'1'}");
                res.end();
                db.close();
                return;
            }
            console.log(5);
            //执行一条插入
            var r1= yield db.collection(cn).insertOne({"userid":userId})
            var errRet={};
            errRet.err="0";
            errRet.execResult="0";
            res.send(JSON.stringify(errRet));
            //res.send("{err:'0',execResult:'0'}");
            res.end();
            db.close();
        }).catch(function(err) {
            db.close();
            console.log(err.stack);
        });
    })
});

/**
 *execResult 0 ok
 *execResult 1公司id不存在
 *execResult 2失败
 */
router.post('/xy', function(req, res, next) {
    //console.log(req.body+" "+req.body.useid);
    var cid=req.body.companyid;
    if (cid==undefined) {
        var errRet={};
        errRet.err="0";
        errRet.execResult="2";
        res.send(JSON.stringify(errRet));
        res.end();
        //db.close();
        return;
    }
    Mongo.connect(driverStr, function(err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var co = require('co');
        co(function*() {
            //console.log("11");
            var r=yield db.collection(cn).count({"companyid":cid});
            if(r==0){
                var errRet={};
                errRet.err="0";
                errRet.execResult="1";
                res.send(JSON.stringify(errRet));
                res.end();
                db.close();
                return;
            }
            var r1=yield db.collection(cn).find({"companyid":cid}).toArray();
            var ret=r1[0];
            ret.err="0";
            ret.execResult="0";
            res.send(JSON.stringify(ret));
            res.end();
            db.close();
            
            //db.collection(cn).find({"companyid":cid},function(err,docs){
            //    if (err) {
            //        res.send("{err:0,execResult:2}");
            //        res.end();
            //        return;
            //    }
            //    console.log('start');
            //    docs.forEach(function(doc){
            //        console.log(doc); 
            //    });
            //    console.log('end'); 
            //    res.send("{err:0,execResult:0}");
            //    res.end();
            //    db.close();
            //});
        }).catch(function(err) {
            db.close();
            console.log(err.stack);
        });
    })
});

/**
 *execResult 0 ok
 *execResult 1 用户id不存在
 *execResult 2 失败
 *
 *ckinResult 0 打卡成功
 *ckinResult 1 今日已打卡
 *
 *isLate     0 未迟到
 *isLate     1 吃到
 *
 *today      yyyy-mm-dd
 *
 *time       hh:mm
 */
router.post('/checkin', function(req, res, next) {
    var userId=req.body.userid;
    if (userId==undefined) {
        var errRet={};
        errRet.err="0";
        errRet.execResult="2";
        res.send(JSON.stringify(errRet));
        res.end();
        //db.close();
        return;
    }
    Mongo.connect(driverStr, function(err, db){
        if (err) {
            console.log(err);
            return;
        }
        var co = require('co');
        co(function* () {   
            var r=yield db.collection(cn).count({"userid":userId});
            if(r==0){//用户不存在
                var errRet={};
                errRet.err="0";
                errRet.execResult="1";
                res.send(JSON.stringify(errRet));
                res.end();
                db.close();
                return;
            }
            //目前只打一次卡 so 就这样
            r=yield db.collection(cn).findOne({"type":"in","index":1});
            var hour=r.hour;
            var minute=r.minute;
            //获取用户当日的打卡记录
            var today=new Date();
            var todayYear=today.getFullYear();
            var todayMonth=today.getMonth()+1;
            if (todayMonth<10) {
               todayMonth="0"+todayMonth;
            }
            var todayDay=today.getDate();
            if (todayDay<10) {
               todayDay="0"+todayDay;
            }
            var ckDay=todayYear+"-"+todayMonth+"-"+todayDay;
            console.log(ckDay);
            r=yield db.collection(cn).count({"userid":userId,"today":ckDay});
            if (r==0) {//今天还未打卡
                var isLate=0;
                var nowHour=today.getHours();
                var nowMin=today.getMinutes();
                if (hour<nowHour) {
                    isLate=1;
                }else if (hour>nowHour) {
                    //
                }else if (hour==nowHour) {
                    if (minute<nowMin) {
                        isLate=1;
                    }else if (minute>nowMin) {
                        //
                    }else if (minute==nowMin) {
                        //
                    }                    
                }
                console.log(isLate+" "+ckDay);
                var _time=(nowHour<10?"0"+nowHour:nowHour)+":"+(nowMin<10?"0"+nowMin:nowMin);
                r=yield db.collection(cn).insertOne({"userid":userId+"","today":ckDay,"isLate":isLate+"","time":_time});
                var retJson={};
                retJson.userid=(userId+"");
                retJson.today=ckDay;
                retJson.time=_time;
                retJson.ckinResult="0";
                retJson.execResult="0";
                retJson.isLate=isLate;
                res.send(JSON.stringify(retJson));
                res.end();
                db.close();               
                return;
            }//直接返回今天的打卡记录
            r=yield db.collection(cn).findOne({"userid":userId,"today":ckDay});
            var retJson={};
            retJson.userid=(r.userid+"");
            retJson.today=r.today;
            retJson.time=r.time;
            retJson.ckinResult="1";
            retJson.execResult="0";
            retJson.isLate=isLate;
            res.send(JSON.stringify(retJson));
            res.end();
            db.close();   
        }).catch(function(err) {
            db.close();
            console.log(err.stack);
        });
    });
});

module.exports = router;


