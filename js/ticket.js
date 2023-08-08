document.addEventListener("DOMContentLoaded", function () {
  const selectedSeanceData = JSON.parse(localStorage.getItem("selectedSeance"))
  const selectedSeatsInfo = JSON.parse(
    localStorage.getItem("selectedSeatsInfo")
  )
  const totalCost = localStorage.getItem("totalCost")

  if (selectedSeanceData && selectedSeatsInfo && totalCost) {
    const { filmName, seanceTime, hallName } = selectedSeanceData

    const filmNameElement = document.querySelector(".ticket__title")
    const seatsElement = document.querySelector(".ticket__chairs")
    const hallElement = document.querySelector(".ticket__hall")
    const seanceStartElement = document.querySelector(".ticket__start")

    filmNameElement.textContent = `${filmName}`

    const seatsHTML = selectedSeatsInfo
      .map((seat, index) => `${index + 1}: ${seat.type} (${seat.price} руб)`)
      .join(", ")
    seatsElement.textContent = `${seatsHTML}`

    hallElement.textContent = `${hallName}`
    seanceStartElement.textContent = `${seanceTime}`
    const qrData = `${filmName}\n${seatsHTML}\n${hallName}\n${seanceTime}`

    // генерируем QR-код по айдишнику
    const qrcodeContainer = document.querySelector("#qrcode")
    const qrcode = QRCreator(qrData)

    if (qrcode.error) {
      qrcodeContainer.textContent = `Ошибка: ${qrcode.error}`
    } else {
      // контейнер для QR-код
      qrcodeContainer.innerHTML = ""
      qrcodeContainer.appendChild(qrcode.result)
    }
  }
})
