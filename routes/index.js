const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({extended: true});
const urlJSONParser = bodyParser.json()
const tokenVerifier = require('./tokenVerifier').tokenVerifier
const gettingCities = require('./requestsSQL').gettingCities
const requesterCurrentWeather = require('./requestsHTTP').requesterCurrentWeather
const accountChecker = require('./authentication').accountChecker
const registrar = require('./authentication').registrar
const setterCitiesInDB = require('./requestsSQL').setterCitiesInDB
const requester5Weather = require('./requestsHTTP').requester5Weather

//=============================== Root ===================================
router.get('/', (req, res) => {
  if (req.cookies.token) {res.redirect("/My_favorite_cities")
  } else {res.render("loginForm", {logReg: 'log'})}
})

//=============================== Choose_cities ===================================
router.get('/Choose_cities_on', tokenVerifier, gettingCities, (req, res) => {
  res.render("ChooseCities.hbs", {name: res.locals.userName, listCities: res.locals.arrCities})
})

//=============================== My_favorite_cities  ===================================
router.get('/My_favorite_cities', tokenVerifier, gettingCities, requesterCurrentWeather, (req, res) => {
  res.render("MyCities.hbs", res.locals.arrCitiesWeather)         
})

//=============================== Login page - Inner ===================================
router.post('/login', urlJSONParser, accountChecker, (req, res) => {
  res.cookie('token', res.locals.token).status(200).send('/My_favorite_cities')
});

//=============================== Register  ===================================
router.get('/register', urlJSONParser, (req, res) => {
  res.render("loginForm.hbs", {})
});

//=============================== Registration - Inner ===============================
router.post('/registration', urlJSONParser, registrar, (req, res) => {
  res.cookie('token', res.locals.token).status(200).send('/My_favorite_cities')         
})

//=============================== add Cities - Inner ===============================
router.post('/addCities', urlJSONParser, tokenVerifier, setterCitiesInDB, (req, res) => {
  res.status(200).send('/My_favorite_cities')
})

//=============================== one City ===============================
router.get('/city/:cityName', urlencodedParser, tokenVerifier, requester5Weather, (req, res) => {
  res.render("OneCity.hbs", res.locals.arrWeather) 
})

module.exports = router


