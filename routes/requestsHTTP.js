const request = require('request')
const key = 'a2e6fb6807c8b5754b1a8934385cf4fc'

module.exports.requesterCurrentWeather = (req, res, next) => {
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

module.exports.requester5Weather = (req, res, next) => {
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