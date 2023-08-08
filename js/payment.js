document.addEventListener("DOMContentLoaded", function () {
  const selectedSeanceData = JSON.parse(localStorage.getItem("selectedSeance"))
  const selectedSeatsInfo = JSON.parse(
    localStorage.getItem("selectedSeatsInfo")
  )
  const selectedSeatsDetails = JSON.parse(
    localStorage.getItem("selectedSeatsDetails")
  )
  const totalCost = localStorage.getItem("totalCost")

  if (
    selectedSeanceData &&
    selectedSeatsInfo &&
    selectedSeatsDetails &&
    totalCost
  ) {
    const { filmName, seanceTime, hallName } = selectedSeanceData

    const filmNameElement = document.querySelector(".ticket__title")
    const seatsElement = document.querySelector(".ticket__chairs")
    const hallElement = document.querySelector(".ticket__hall")
    const seanceStartElement = document.querySelector(".ticket__start")
    const costElement = document.querySelector(".ticket__cost")

    const selectedSeatsHTML = selectedSeatsInfo
      .map(
        (seat, index) => `
        <p> ${selectedSeatsDetails[index]} </p>
      `
      )
      .join("")

    filmNameElement.textContent = filmName
    seatsElement.innerHTML = selectedSeatsHTML
    hallElement.textContent = hallName
    seanceStartElement.textContent = seanceTime
    costElement.textContent = `${totalCost} рублей`
  }
})
