const express = require('express')
const app = express()
const mariadb = require('mariadb/callback')
const expressHbs = require("express-handlebars")
const hbs = require('hbs')
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use("/", require("./routes/index"))
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


const connection = mariadb.createPool({
  host: 'localhost',
  user: 'test_user',
  password: 'cubexZap',
  database: 'weather_App'
})

// connection.connect((err) => {
//  if (!err) console.log('DB connection succeded.');
//  else console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
// })

app.listen(3000, () => console.log('Express server is runnig at port no : 3000'));

module.exports.connection = connection