let express = require('express');
let app = express();
let mysql = require('mysql');
let util = require('util');
let url = require('url');
let bodyparser = require('body-parser');

let urlencodedParser = bodyparser.urlencoded({extended: false});
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

/*app.use(function(req, res){
  res.header("Access-Control_Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, ");
  next();
})*/

let path = require('path');

let con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'todo',
});
const query = util.promisify(con.query).bind(con);

con.connect(function(err) {
  if (err) throw err;
  //con.query("SELECT * FROM event", function (err, result, fields) {
  //if (err) throw err;
  //console.log(result);
  console.log('Connected');
  //});
});

app.get('/api/events', function(req, res) {
  console.log('Get tasks from a certain period');
  let q = url.parse(req.url, true).query;
  let params = q.start + ' ' + q.end;
  let startDate = q.start;
  let endDate = q.end;
  let alteredResult;
  let string;
  console.log('Parametrit:' + startDate + ' ' + endDate);

  let sql = 'SELECT event_date.Date, event.Name, event.Type, Location.Location_name'
      + ' FROM event_date, event, location'
      +
      ' WHERE event_date.Event_id = event.Event_id and event.Location_Location_id = Location.Location_id'
      + ' and event_date.Date >= ? and event_date.Date <= ?'
      + ' GROUP BY Name'
      + ' ORDER BY event_date.Date';

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

app.post('/api/event', urlencodedParser, function(req, res) {
  let jsonObj = req.body;
  let responseString = JSON.stringify(jsonObj);

  if (jsonObj.eventLocation > -1) { // is  a location place already present?
    let sql = 'INSERT INTO event (Name, Type, Location_location_id)'
        + ' VALUES ( ?, ?, ?)';
    (async () => {  // IIFE (Immediately Invoked Function Expression)
      try {
        const result = await query(sql, [
          jsonObj.eventName,
          jsonObj.eventType,
          jsonObj.eventLocation]);

        let insertedId = result.insertId;
        sql = 'INSERT INTO Event_date (Date, Event_id)'
            + ' VALUES ( ?, ?)';
        await query(sql, [jsonObj.eventDate, insertedId]);
        res.send('POST succesful ' + req.body);

      } catch (err) {
        console.log('Insertion into some (2) table was unsuccessful!' + err);
        res.send('POST was not succesful ' + err);
      }

    })();

  } else {

    let sql = 'INSERT INTO location (Location_name, Street_address, City, Zip, Country)'
        + ' VALUES (?, ?, ?, ?, ?)';
    (async () => {
      try {
        const resultLocation = await query(sql, [
          jsonObj.locPlaceName,
          jsonObj.locStreetAddress,
          jsonObj.locCity,
          jsonObj.locZip,
          jsonObj.locCountry]);

        let insertedLocationId = resultLocation.insertId;
        sql = 'INSERT INTO event (Name, Type, Location_location_id)'
            + ' VALUES ( ?, ?, ?)';
        const resultEvent = await query(sql, [
          jsonObj.eventName,
          jsonObj.eventType,
          insertedLocationId]);

        let insertedEventId = resultEvent.insertId;

        sql = 'INSERT INTO Event_date (Date, Event_id)'
            + ' VALUES ( ?, ?)';
        await query(sql, [jsonObj.eventDate, insertedEventId]);

        res.send('POST succesful ' + req.body);

      } catch (err) {
        console.log('Insertion into some (2) table was unsuccessful!' + err);
        res.send('POST was not succesful ' + err);
      }

    })();
  }
});

let server = app.listen(8082, function() {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

