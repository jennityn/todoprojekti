const express = require('express');
let bodyParser = require('body-parser');
const cors = require('cors');
const app = express();


app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', (req, res) => {
  res.json({message: 'toimii'});
});

let url = require('url');

let mysql = require('mysql');
let con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: '',
});

con.connect(error => {
  if (error) throw error;
  console.log('Successfully connected to the database.');
});

let util = require('util');
const query = util.promisify(con.query).bind(con);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

let urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/api/todos', function(req, res) {
  console.log('Get tasks from a certain period');
  let q = url.parse(req.url, true).query;
  let params = q.start + ' ' + q.end;
  let startDate = q.start;
  let endDate = q.end;
  let alteredResult;
  let string;
  console.log('Parametrit:' + params);

  let sql = 'SELECT week_id, description, done'
      + ' FROM task'
      +
      ' WHERE week_id >= ? and week_id >= ?'
      + ' GROUP BY description'
      + ' ORDER BY week_id';

  (async () => { // IIFE (Immediately Invoked Function Expression)
    try {
      const rows = await query(sql, [startDate, endDate]);
      string = JSON.stringify(rows);
      alteredResult = '{"numOfRows":' + rows.length + ',"rows":' + string + '}';
      console.log(alteredResult);
      console.log(rows);
      res.send(alteredResult);

    } catch (err) {
      console.log('Database error!' + err);
    } finally {
      //conn.end();
    }
  })();
});

app.post('/api/add', urlencodedParser, function(req, res) {
  let jsonObj = req.body;
  let responseString = JSON.stringify(jsonObj);

  let sql = 'INSERT INTO task (task_id, week_id, description, done)'
      + ' VALUES (?, ?, ?, ?)';
  (async () => {
    try {
      await query(sql, [
        jsonObj.taskId,
        jsonObj.weekId,
        jsonObj.taskDescription,
        jsonObj.taskDone
        ]);

      res.send('POST succesful ' + responseString);

    } catch (err) {
      console.log('Insertion into was unsuccessful!' + err);
      res.send('POST was not succesful ' + err);
    }

  })();
});


/*











/*app.use(function(req, res){
  res.header("Access-Control_Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, ");
  next();
})*/

/*let path = require('path');


const query = util.promisify(con.query).bind(con);





app.get('/events', function(req, res) {
  res.sendFile(path.join(__dirname + '/server.html'));
});

app.get('api/location', function(req, res) {
  console.log('Get location address');
  let q = url.parse(req.url, true).query;
  let params = q.locationName;
  let location = q.locationName;
  let alteredResult;
  let string;
  console.log('Parametrit:' + location);

  let sql = 'SELECT Street_address, City, Zip, Country'
      + ' FROM location'
      +
      ' WHERE Location_name = ?'
      + ' GROUP BY Street_address'
      + ' ORDER BY Street_address';

  (async () => { // IIFE (Immediately Invoked Function Expression)
    try {
      const rows = await query(sql, [location]);
      string = JSON.stringify(rows);
      alteredResult = '{"numOfRows":' + rows.length + ',"rows":' + string + '}';
      console.log(alteredResult);
      console.log(rows);
      res.send(alteredResult);

    } catch (err) {
      console.log('Database error!' + err);
    } finally {
      //conn.end();
    }
  })();
});

app.post('/api/testingevent', urlencodedParser, function(req, res) {
  //console.log("Request body: " + req.body);
  //console.log("Request body length: " + req.body.getLength);

  console.log('body: %j', req.body);
  // get JSON-object from the http-body
  let jsonObj = req.body;
  console.log('Arvo: ' + jsonObj.eventName);
  // make updates to the database
  let responseString = JSON.stringify(jsonObj);
  res.send('POST successful: ' + responseString);
});





  console.log('Example app listening at http://%s:%s', host, port);
});*/

