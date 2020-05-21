const onclickHandler = (event) => {
  const nameCity = event.currentTarget.firstElementChild.innerHTML
  document.location.href = "/city/" + nameCity
}