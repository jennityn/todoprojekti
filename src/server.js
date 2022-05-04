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
  password: 'TipuTopakka92',
  database: 'todo2',
});

con.connect(error => {
  if (error) throw error;
  console.log('Successfully connected to the database.');
});

let util = require('util');
const {re} = require('@babel/core/lib/vendor/import-meta-resolve');
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

  let sql = 'SELECT id, week, description, done'
      + ' FROM task'
      +
      ' WHERE week >= ? and week<= ?'
      + ' GROUP BY description'
      + ' ORDER BY id';

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

app.post('/api/add/:id', urlencodedParser, function(req, res) {
  console.log('body: %j', req.body);
  var todoId = req.params.id;
  let jsonObj = req.body;
  let responseString = JSON.stringify(jsonObj);

  let addNew = 'INSERT INTO task (id) VALUES (?)';

  (async () => {
    try {
      await query(addNew,todoId);

      let sql = 'UPDATE task SET week = ?, description = ?, done = ?'
          + ' WHERE id = ?';
      await query(sql,[jsonObj.week,
        jsonObj.description,
        jsonObj.done,
          todoId
      ]);

      res.send('POST succesful ' + responseString);
    } catch (err) {
      console.log('Insertion into was unsuccessful!' + err);
      res.send('POST was not succesful ' + err);
    }

  })();
});
