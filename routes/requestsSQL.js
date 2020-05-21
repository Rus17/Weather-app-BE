const express = require('express')
const db = require('../server')

module.exports.setterCitiesInDB = (req, res, next) => {
  // If the user has selected cities, then add from to the database
  if(Object.keys(req.body).length !== 0) {
    const userData = [req.body.cities, res.locals.userName]
    const sql = 'UPDATE UserWether SET Cities=? WHERE UserName = ?'      
    db.connection.query(sql, userData, (err, results, fields) => {
      if (!err){          
        next()

      } else {res.sendStatus(403)}
    })
  } else res.status(403).send('You have not selected any cities')  
}

module.exports.gettingCities = (req, res, next) => {
  //Get the list of user cities from the DB
  const sql = 'SELECT Cities FROM UserWether WHERE UserName = ?'
  let arrCities
  db.connection.query(sql, res.locals.userName, (err, results, fields) => {
    if (!err) {
      if(results[0].Cities){
        arrCities = results[0].Cities.split("|")
      }
      res.locals.arrCities = arrCities
      next()

    } else res.sendStatus(403)
  })   
}