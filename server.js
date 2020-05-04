//express import
var express  = require('express'),
    logger = require('morgan'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
	mysql = require("mysql");
var config = require('./config');
//initilize express constructor
var app      = express();

//port configuration
var port  	 = process.env.PORT || 3000;

//Allow acces-controll 'cross origin support'
//Allow acces-controll 'cross origin support'
app.use(function(req, res, next) {
 res.header('Access-Control-Allow-Origin', '*');
 next();
});

var app = express();
//initialize config variables
var jwtsecret = config.app.jwtsecret;
var viewpath = config.app.views; // setting webui tree location.
var securedpath = config.app.securedpath;
console.log('--------------------->' + securedpath);



app.use(function (req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    //    res.header("Access-Control-Allow-Origin", "http://localhost:8100");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, config.app.views)));



app.get('/', function (req, res) {

    res.sendStatus(200);
});

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

//require API File
require('./app/api.js')(app);
require('./app/building.js')(app);

app.listen(port);
console.log("App listening on port " + port);
