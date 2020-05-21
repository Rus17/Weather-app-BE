// this file is not used in the application

const express = require('express')
const app = express()
const mariadb = require('mariadb/callback')
const expressHbs = require("express-handlebars")
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const hbs = require('hbs')
const urlencodedParser = bodyParser.urlencoded({extended: true});
const urlJSONParser = bodyParser.json()

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretOrPrivateKey = 'q1w2e3r4t5y6u7i8o9p0'

const request = require('request');
const key = 'a2e6fb6807c8b5754b1a8934385cf4fc'

app.use(cookieParser())
app.use(express.static('public'))

app.engine("hbs", expressHbs(
  {
    layoutsDir: "views/layouts", 
    defaultLayout: "layout",
    extname: "hbs"
  }
))
app.set("view engine", "hbs")
hbs.registerPartials(__dirname + '/views/partials')

const connection = mariadb.createConnection({
  host: 'localhost',
  user: 'test_user',
  password: 'cubexZap',
  database: 'weather_App'
})

connection.connect((err) => {
  if (!err)
      console.log('DB connection succeded.');
  else
      console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
});

app.listen(3000, () => console.log('Express server is runnig at port no : 3000'));

//=============================== Token Verification ===================================

app.use('/*on', (req, res, next) => {
  console.log('token in middleware: ', req.cookies.token)
  let token = req.cookies.token

  if(token) {
    // Верификация токена
    let decoded = jwt.verify(token, secretOrPrivateKey);  //Извлекаем из него данные    
    const userData = [decoded.Name, decoded.Email];
    const sql = 'SELECT * FROM UserWether WHERE UserName = ? AND Email = ?'
    //Ищем пользователя с данными Name и Email и если есть, то вернуть запрашиваемую страничку
    connection.query(sql, userData, (err, results, fields) => {
      // console.log('results sql: ', results)
      if (!err){
        //Если верификация данных прошла успешно, отправляем на фронт "ОК"
        if(results.length > 0) {
          res.locals.userName = decoded.Name
          next()
        } else res.sendStatus(403)
      } else res.sendStatus(403)        
    })
    // ==== /Верификация токена
  } else {
    // console.log("no token")
    res.sendStatus(403)
  }
})

const tokenVerifier = (req, res, next) => {
  let token = req.cookies.token
  if(token) {
    let decoded = jwt.verify(token, secretOrPrivateKey);  //Extract data from token  
    const userData = [decoded.Name, decoded.Email];
    const sql = 'SELECT * FROM UserWether WHERE UserName = ? AND Email = ?'
    connection.query(sql, userData, (err, results, fields) => {
      if (!err){
        //If the user with the Name and Email is in the DB, then send "ОК"
        if(results.length > 0) {
          res.locals.userName = decoded.Name
          next()
        } else res.sendStatus(403)
      } else res.sendStatus(403)        
    })
  } else {
    res.render("loginForm", {logReg: 'log'});
  }
}

const gettingCities = (req, res, next) => {
  //Получаем список городов пользователя
  const sql = 'SELECT Cities FROM UserWether WHERE UserName = ?'
  let arrCities
  connection.query(sql, res.locals.userName, (err, results, fields) => {
    if (!err) {
      if(results[0].Cities){
        arrCities = results[0].Cities.split("|")
      }
      res.locals.arrCities = arrCities
      next() 
    } else res.sendStatus(403)
  })   
}

const accountChecker = (req, res, next) => {
  const sql = 'SELECT * FROM UserWether WHERE UserName = ?'
  connection.query(sql, req.body.login, (err, results, fields) => {    
    if (!err && results.length > 0){ 
      bcrypt.compare(req.body.pass, results[0].Passwd, function(err, result) {
        if(result == true){
          let payload = {Name: results[0].UserName, Email: results[0].Email}        
          let token = jwt.sign(payload, secretOrPrivateKey)
          res.locals.token = token
          next()
                  
        } else {
          res.status(403).send('Password error')
        }
      })
    } else {
      res.status(403).send('Login error')
    }
  })
}

const registrar = (req, res, next) => {
  //Create a new account in the DB if there is no such user
  const sql = "SELECT UserName FROM UserWether WHERE UserName = ?"
  connection.query(sql, req.body.login, (err, results, fields) => {
    if (!err){
      if(results.length > 0){
        res.status(403).send('A user with this name is already registered. Choose a different name.')
      } else {
        // Create a password hash
        bcrypt.hash(req.body.pass, 10, function(err, hash) {
          if (err){res.sendStatus(500)}
          else {
            // We write all the data of the new user to the DB
            const userData = [req.body.login, req.body.email, hash];
            const sql = "INSERT INTO UserWether(UserName, Email, Passwd) VALUES(?, ?, ?)"  
            connection.query(sql, userData, (err, results, fields) => {
              if (!err){console.log(results)
              } else {console.log(err)}
            })
            // We generate a token and send it to the browser
            let payload = {Name: req.body.login, Email: req.body.email}
            let token = jwt.sign(payload, secretOrPrivateKey)
            res.locals.token = token
            next()

          }
        })        
      }    
    } else {res.send(err)}
  })
}

const requesterCurrentWeather = (req, res, next) => {
  if(res.locals.arrCities){
    let arrCitiesWeather = []

    res.locals.arrCities.forEach((elem, i, arr) => {
      request(`http://api.openweathermap.org/data/2.5/weather?q=${elem}&appid=${key}`, (err, resp, body) => {
        if (!err) {
          arrCitiesWeather.push(JSON.parse(body))
          if(i === arr.length - 1){

            const data = {
              name: res.locals.userName,
              citiesFav: res.locals.arrCities,
              arrCitiesWeather: arrCitiesWeather
            }
            res.locals.arrCitiesWeather = data
            next()
            
          }
        }
      })                 
    })
  } else {
    res.render("MyCities", {name: res.locals.userName})
  }    
}

const requester5Weather = (req, res, next) => {
  request(`http://api.openweathermap.org/data/2.5/forecast?q=${req.params.cityName}&appid=${key}`, (err, resp, body) => {
    if (!err) {
      const arrWeather = {
        cityInfo: JSON.parse(body),
        name: res.locals.userName
        }
      res.locals.arrWeather = arrWeather
      next()

    }
  }) 
}

const setterCitiesInDB = (req, res, next) => {
    // If the user has selected cities, then add from to the database
    if(Object.keys(req.body).length !== 0) {
      const userData = [req.body.cities, res.locals.userName]
      const sql = 'UPDATE UserWether SET Cities=? WHERE UserName = ?'      
      connection.query(sql, userData, (err, results, fields) => {
        if (!err){          
          next()

        } else {res.sendStatus(403)}
      })
    } else res.status(403).send('You have not selected any cities')  
}


//=============================== Root ===================================
app.get('/', (req, res) => { 
  if (req.cookies.token) {res.redirect("/My_favorite_cities")
  } else {res.render("loginForm", {logReg: 'log'})}
})

//=============================== Choose_cities ===================================
app.get('/Choose_cities_on', tokenVerifier, gettingCities, (req, res) => {
  res.render("ChooseCities.hbs", {name: res.locals.userName, listCities: res.locals.arrCities})
})

//=============================== My_favorite_cities - Inner ===================================
app.get('/My_favorite_cities', tokenVerifier, gettingCities, requesterCurrentWeather, (req, res) => {
  res.render("MyCities.hbs", res.locals.arrCitiesWeather)         
})

//=============================== Login page - Inner ===================================
app.post('/login', urlJSONParser, accountChecker, (req, res) => {
  res.cookie('token', res.locals.token).status(200).send('http://localhost:3000/My_favorite_cities')
});

//=============================== Register real page ===================================
app.get('/register', urlJSONParser, (req, res) => {
  res.render("loginForm.hbs", {})
});

//=============================== Registration - Inner ===============================
app.post('/registration', urlJSONParser, registrar, (req, res) => {
  res.cookie('token', res.locals.token).status(200).send('http://localhost:3000/My_favorite_cities')         
})

//=============================== add Cities - Inner ===============================
app.post('/addCities', urlJSONParser, tokenVerifier, setterCitiesInDB, (req, res) => {
  res.status(200).send('http://localhost:3000/My_favorite_cities')
})

//=============================== one City ===============================
app.get('/city/:cityName', urlencodedParser, tokenVerifier, requester5Weather, (req, res) => {
  res.render("OneCity.hbs", res.locals.arrWeather) 
})




