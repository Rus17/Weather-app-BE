const jwt = require('jsonwebtoken')
const secretOrPrivateKey = 'q1w2e3r4t5y6u7i8o9p0'
const express = require('express')
const db = require('../server')

module.exports.tokenVerifier = (req, res, next) => {
  let token = req.cookies.token
  if(token) {
    let decoded = jwt.verify(token, secretOrPrivateKey);  //Extract data from token  
    const userData = [decoded.Name, decoded.Email];
    const sql = 'SELECT * FROM UserWether WHERE UserName = ? AND Email = ?'
    db.connection.query(sql, userData, (err, results, fields) => {
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