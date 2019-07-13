//killall node

let http = require("http");
let https = require("https");
let fs = require("fs");
let qs = require("querystring");

let PORT = 8080;

let mysql = require("mysql");
var mydata;

http
  .createServer(function(req, res) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST,GET",
      "Access-Control-Max-Age": 2592000
    };

    switch (req.method) {
      case "GET": {
        switch (req.url) {
          case "/": {
            // to client index.html ./client/public/index.html

            fs.readFile("index.html", function(err, data) {
              res.writeHead(200, {
                "Content-Type": "text/html",
                "Content-Length": data.length
              });
              res.write(data);
              res.end();
            });

            break;
          }
          case "/favicon.ico": {
            break;
          }
          case "/api/users/data": {

            res.writeHead(200, headers);

            connection = connectToDB(res);
          
            getUserData(connection).then((data)=>{
              mydata = data;
            }).catch(()=> {
              console.log("error getting data")
            })

            if(mydata != null)
            {
              res.write(mydata)
            }else {
              res.write("refresh")
            }

            res.end();
            break;
          }
          default: {
            console.log("not found: " + req.url);
            res.end();
          }
        }
        break;
      }
      case "POST": {
        switch (req.url) {

          case "/sendData":{
            console.log("react Called this")
            res.end();
            break;
          }

          case "/req-data": {
            //console.log('req data POST')

            var reqBody = "";

            req.on("data", data => {
              reqBody += data;

              if (reqBody.length > 1e7) {
                // 10 MB Storage
                res.writeHead(413, "Request too large", {
                  "Content-Type": "text/html"
                }); //413 too much data code
              }
            });

            req.on("end", data => {
              var formData = qs.parse(reqBody);

              var user = (fname, lname) => {
                (fname = this.fname), (lname = this.lname);
              };

              user.fname = formData.fname;
              user.lname = formData.lname;

              var connection = connectToDB(res);

              addUserToDB(connection, user);


            });

            res.end();
            break;
          }
        }
      }
    }
  })
  .listen(PORT, res => {
    console.log(`running on port ${PORT}`);
  });

function connectToDB(res) {
  var connection = mysql.createConnection({
    host: "novellotestdb.cegmthjt6sm8.us-east-2.rds.amazonaws.com",
    user: "root",
    password: "novello2",
    database: "novelloTestDB"
  });

  connection.connect(function(err) {
    if (err) throw err;
    // console.log("connected!");
  });

  return connection;
}

function getUserData(connection) {
  var sql = "SELECT * FROM users";

  return new Promise((resolve, reject)=>{
    connection.query(sql, function(err, result) {
        if(err) throw reject("Error get user data")
        resolve(JSON.stringify(result))
    });
  })

}

function addUserToDB(connection, user) {
  var sql = `INSERT INTO users(fname,lname) VALUES("${user.fname}","${
    user.lname
  }")`;

  connection.query(sql, function(err, result) {
    if (err) throw err;


  });
}
