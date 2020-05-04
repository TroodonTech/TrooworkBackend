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





    app.options('/authenticate_SuType');

    app.post('/authenticate_SuType', function (req, res) {


        var userid = req.body.uname;

        var password = req.body.pwd;
        var tenantId = req.body.tid;

        var profile = {};

        DBPoolConnectionTry();
        pool.getConnection(function (err, connection) {
            if (err) {

                console.log("Failed! Connection with Database spicnspan via connection pool failed");
            }
            else {
                console.log("Success! Connection with Database spicnspan via connection pool succeeded");
                connection.query("set @u_name=?;set @pwdd=?; set @tenantId=?; call usp_userLogin_SuType(@u_name,@pwdd,@tenantId)", [userid, password, tenantId], function (err, employees) {
                    if (err) {
                        console.log("INSIDE errr() condition in /authenticate " + JSON.stringify(err));
                    }
                    console.log("entire response  " + JSON.stringify(employees));

                    if (!employees[3][0]) {// if returns a void json like '[]'

                        console.log('Wrong user or password');

                        res.end('Wrong user or password');
                        return;
                    } else {
                        console.log('Employee : ' + employees[3][0]["UserName"]);

                        user_return = employees[3][0]["UserId"];
                        organization = employees[3][0]["OrganizationName"];

                        username_return = employees[3][0]["UserName"];
                        role_return = employees[3][0]["UserRole"];

                        employeekey_return = employees[3][0]["EmployeeKey"];
                        isSupervisor = employees[3][0]["IsSupervisor"];
                        organizationID = employees[3][0]["OrganizationID"];
                        isemployeecalendar = employees[3][0]["IsEmployeeCalendar"];// Author Prakash for employee Calender

                        profile = {
                            user: user_return,
                            username: username_return,
                            role: role_return,
                            employeekey: employeekey_return,
                            //            password: pass_return,
                            IsSupervisor: isSupervisor,
                            Organization: organization,
                            OrganizationID: organizationID,
                            isemployeecalendar: isemployeecalendar// Author Prakash for employee Calender
                        };
                    }
                    // We are sending the profile inside the token
                    var jwttoken = jwt.sign(profile, jwtsecret, { expiresIn: '4h' });

                    res.cookie('refresh-token', jwttoken, 'httpOnly', 'secure')   //, 'secure','httpOnly')  '1h' //use for https
                        .json({ token: jwttoken });
                    console.log("jwttoken" + jwttoken);
                });
            }
            connection.release();
        });
    });


    app.get(securedpath + '/welcomeMessage', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        var empKey = url.parse(req.url, true).query['empKey'];
        var OrganizationID = url.parse(req.url, true).query['OrganizationID'];

        pool.getConnection(function (err, connection) {
            if (err) {

                console.log("Failed! Connection with Database spicnspan via connection pool failed");
            }
            else {
                console.log("Success! Connection with Database spicnspan via connection pool succeeded");
                connection.query('set @empkey=?;set @OrganizationID=?; call usp_welcomeMessage(@empkey,@OrganizationID)', [empKey, OrganizationID], function (err, rows) {
                    if (err) {
                        console.log("Problem with MySQL" + err);
                    }
                    else {
                        console.log("welcomeMessage...from server.." + JSON.stringify(rows[2]));
                        res.end(JSON.stringify(rows[2]));
                    }
                });
            }
            connection.release();
        });
    });

    app.get(securedpath + '/welcomeUpdateMessage', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        var empKey = url.parse(req.url, true).query['empKey'];
        var OrganizationID = url.parse(req.url, true).query['OrganizationID'];

        pool.getConnection(function (err, connection) {
            if (err) {

                console.log("Failed! Connection with Database spicnspan via connection pool failed");
            }
            else {
                console.log("Success! Connection with Database spicnspan via connection pool succeeded");
                connection.query('set @empkey=?;set @OrganizationID=?; call usp_welcomeUpdateMessage(@empkey,@OrganizationID)', [empKey, OrganizationID], function (err, rows) {
                    if (err) {
                        console.log("Problem with MySQL" + err);
                    }
                    else {
                        console.log("welcomeMessage...from server.." + JSON.stringify(rows[2]));
                        res.end(JSON.stringify(rows[2]));
                    }
                });
            }
            connection.release();
        });
    });

    app.get(securedpath + '/MaintnancUpdateMsg', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        var empKey = url.parse(req.url, true).query['empKey'];
        var OrganizationID = url.parse(req.url, true).query['OrganizationID'];

        pool.getConnection(function (err, connection) {
            if (err) {

                console.log("Failed! Connection with Database spicnspan via connection pool failed");
            }
            else {
                console.log("Success! Connection with Database spicnspan via connection pool succeeded");
                connection.query(" set @empKey=?;set @OrganizationID=?; call usp_MaintnancUpdateMsg(@empKey,@OrganizationID)", [empKey, OrganizationID], function (err, rows) {
                    if (err) {
                        console.log(err);
                    }
                    else {

                        res.end(JSON.stringify(rows[2]));
                    }

                });
            }
            connection.release();
        });
    });

};
