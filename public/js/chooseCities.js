window.addEventListener("load", () => {
  const citySelectionForm = document.getElementById("citySelection")

  const listCities = document.getElementById("listCities").innerHTML
  const arrCities = listCities.split(",")
  const allCities = ["Kiev", "Kharkiv", "Dnipro", "Lviv", "Zaporizhzhia", "Odessa", "Chernihiv", "Kherson", "Rivne", "Balabine"]
  
  allCities.forEach((item) => {
    let elem
    arrCities.forEach((city) => {
      if(city === item){
        elem = `<input type="checkbox" class="inputCity" name="city" checked value=${item}>${item}<Br>`
      }      
    })
    elem = elem || `<input type="checkbox" class="inputCity" name="city" value=${item}>${item}<Br>`
      citySelectionForm.innerHTML += elem
      elem = ''
  })

  citySelectionForm.innerHTML += `<input type="submit" value="Send">`



  citySelectionForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const citiesArr = document.getElementsByClassName("inputCity")
    let citiesChecked = []
    
   for (let i = 0; i < citiesArr.length; i++){
      if(citiesArr[i].checked){
        citiesChecked.push(citiesArr[i].value)            
      }         
    }

    const citiesCheckedStr = citiesChecked.join("|")        
    const url = '/addCities'
    const data = {cities: citiesCheckedStr}

    fetch(url, {
      method: 'POST', 
      headers: new Headers({
        'Content-Type': 'application/json'
      }), 
      body: JSON.stringify(data)
    })
    .then((response) => {
      console.log("res", response)
      
      
      if(response.status === 403){        
        response.text()
        .then((body) => {
          console.log("Не удача body -:", body)
        })
      } else {
        response.text()
        .then((body) => {
          console.log("Успех body -:", body)
          document.location.href = body
        })            
      }


    })
  })
})