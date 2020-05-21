const jwt = require('jsonwebtoken')
const secretOrPrivateKey = 'q1w2e3r4t5y6u7i8o9p0'
const bcrypt = require('bcrypt')
const db = require('../server')

module.exports.accountChecker = (req, res, next) => {
  const sql = 'SELECT * FROM UserWether WHERE UserName = ?'
  db.connection.query(sql, req.body.login, (err, results, fields) => {    
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


module.exports.registrar = (req, res, next) => {
  //Create a new account in the DB if there is no such user
  const sql = "SELECT UserName FROM UserWether WHERE UserName = ?"
  db.connection.query(sql, req.body.login, (err, results, fields) => {
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
            db.connection.query(sql, userData, (err, results, fields) => {
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
