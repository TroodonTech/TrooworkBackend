var express = require("express"), mysql = require("mysql"), jwt = require('jsonwebtoken');
var url = require('url');
var appRoutes = express.Router();
var config = require('../config');
var jwtsecret = config.app.jwtsecret;
var securedpath = config.app.securedpath;

module.exports = function (app) {
    var pool = mysql.createPool({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        multipleStatements: true,
        connectionLimit: 250,
        queueLimit: 0,
        debug: true
    });
    function DBPoolConnectionTry2(req, res, next) {
        pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                console.log("Failed! Connection with Database spicnspan via connection pool failed");

            }
            else {
                console.log("Success! Connection with Database spicnspan via connection pool succeeded");
            }
        });
    }
    function DBPoolConnectionTry(req, res, next) {
        pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                console.log("Failed! Connection with Database spicnspan via connection pool failed");
                DBPoolConnectionTry2();
            }
            else {
                console.log("Success! Connection with Database spicnspan via connection pool succeeded");
            }
        });
    }
    DBPoolConnectionTry();



    //Main Route Sample
    app.get('/', function (req, res) {
        res.send('Hello Microservice API  !');
    });

    //Microservice API root /
    appRoutes.get('/', function (req, res) {
        res.json({
            message: 'Welcome to your Simple Microservice API!'
        });
    });

    //Microservice Sample Method
    appRoutes.get('/dosomething', function (req, res) {

        res.json({
            message: 'Already Done !'
        });
    });


    //Apply and use created appRoutes
    app.use('/api', appRoutes);





    app.get(securedpath + '/allfacilityByPageNo', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        var pageno = url.parse(req.url, true).query['pageno'];
        var itemsperpage = url.parse(req.url, true).query['itemsperpage'];
        var employeekey = url.parse(req.url, true).query['employeekey'];
        var OrganizationID = url.parse(req.url, true).query['OrganizationID'];
        pool.getConnection(function (err, connection) {
            if (err) {
    
                console.log("Failed! Connection with Database spicnspan via connection pool failed");
            }
            else {
                console.log("Success! Connection with Database spicnspan via connection pool succeeded");
                connection.query('set @pageno=?; set @itemsperpage=?; set @empkey=?; set @OrganizationID=?; call usp_getAllFacility_Pagination(@pageno,@itemsperpage,@empkey,@OrganizationID)', [pageno, itemsperpage, employeekey, OrganizationID], function (err, rows) {
                    if (err) {
                        console.log("Problem with MySQL" + err);
                    }
                    else {
                        console.log("allfacilityByPageNo " + JSON.stringify(rows[4]));
                        res.end(JSON.stringify(rows[4]));
                    }
                });
            }
            connection.release();
        });
    });

};
