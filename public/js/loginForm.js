window.addEventListener("load", () => {

  let myForm

  if(document.getElementById("log") !== null){
    myForm = document.getElementById("log")
  } else {
    myForm = document.getElementById("reg")
  }

  myForm.addEventListener("submit", (e) => {
    
    let data = {}
    let url 

    if(document.getElementById("log") !== null){
      data = {
        login: myForm.elements.login.value, 
        pass: myForm.elements.pass.value
      }
      url = '/login'
    } else {
      data = {
        login: myForm.elements.login.value, 
        pass: myForm.elements.pass.value,
        email: myForm.elements.email.value
      }
      url = '/registration'
    } 

    e.preventDefault()
    
    fetch(url, {
      method: 'POST', 
      headers: new Headers({
        'Content-Type': 'application/json'
      }), 
      body: JSON.stringify(data)
    })        
    .then(response => {
      if(response.status === 403){        
        response.text()
        .then((body) => {
          document.getElementsByClassName("error")[0].innerHTML = body
        })
      } else {
        response.text()
        .then((body) => {
          document.location.href = body
          
        })            
      }
    })
  })
})