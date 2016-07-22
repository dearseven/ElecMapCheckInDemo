'use strict'

//--
var express = require('express');
var router = express.Router();
let Mongo=require('mongodb').MongoClient;
var qs = require('querystring');

//--
let driverStr='mongodb://localhost:27017/elecmapcheckin';
let cn='elecmapcheckin';//collectionName;

router.get('/', function(req, res, next) {
    //res.send('1');
    //req.end();
});

/**
 *execResult 0成功
 *execResult 1用户存在
 *execResult 2失败
 *
 */
router.post('/reg', function(req, res, next) {
    //console.log(req.body+" "+req.body.useid);
    var userId=req.body.userid;
    if (userId==undefined) {
        var errRet={};
        errRet.err="0";
        errRet.execResult="2";
        res.send(JSON.stringify(errRet));
        res.end();
        db.close();
        return;
    }
    Mongo.connect(driverStr, function(err, db) {
        if (err) {
            console.log(err);
            db.close();
            return;
        }
        var co = require('co');
        co(function*() {
            //console.log("11");
            var r=yield db.collection(cn).count({"userid":userId});
            if(r!=0){
                var errRet={};
                errRet.err="0";
                errRet.execResult="1";
                res.send(JSON.stringify(errRet));
                //res.send("{err:'0',execResult:'1'}");
                res.end();
                db.close();
                return;
            }
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
        db.close();
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


router.post('/checkin', function(req, res, next) {
    res.send('1');
});

module.exports = router;


