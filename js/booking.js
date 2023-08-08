document.addEventListener("DOMContentLoaded", function () {
  const selectedSeanceData = localStorage.getItem("selectedSeance")
  if (selectedSeanceData) {
    const { filmName, seanceTime } = JSON.parse(selectedSeanceData)

    const filmTitleElement = document.querySelector(".buying__info-title")
    const seanceStartElement = document.querySelector(".buying__info-start")
    const hallNameElement = document.querySelector(".buying__info-hall")

    filmTitleElement.textContent = filmName
    seanceStartElement.textContent = `Начало сеанса: ${seanceTime}`

    const urlParams = new URLSearchParams(window.location.search)
    const hallId = urlParams.get("hallId")
    const seanceId = urlParams.get("seanceId")

    fetch("https://jscp-diplom.netoserver.ru/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "event=update",
    })
      .then((response) => response.json())
      .then((data) => {
        const halls = data.halls.result
        const hall = halls.find((h) => h.hall_id === hallId)

        if (hall) {
          hallNameElement.textContent = `Зал: ${hall.hall_name}`
          const hallConfigHTML = hall.hall_config
          const seatsContainer = document.querySelector(".conf-step__wrapper")
          seatsContainer.innerHTML = hallConfigHTML

          const seats = seatsContainer.querySelectorAll(".conf-step__chair")
          const bookingButton = document.querySelector(".acceptin-button")

          let selectedSeats = []

          seats.forEach((seat, index) => {
            if (
              seat.classList.contains("conf-step__chair_standart") ||
              seat.classList.contains("conf-step__chair_vip")
            ) {
              seat.addEventListener("click", () => {
                if (
                  seat.classList.contains("conf-step__chair_standart") ||
                  seat.classList.contains("conf-step__chair_vip")
                ) {
                  if (selectedSeats.includes(index)) {
                    selectedSeats = selectedSeats.filter((i) => i !== index)
                    seat.classList.remove("conf-step__chair_selected")
                  } else {
                    selectedSeats.push(index)
                    seat.classList.add("conf-step__chair_selected")
                  }
                }
              })
            }
          })

          bookingButton.addEventListener("click", () => {
            const selectedSeatsInfo = selectedSeats.map((index) => {
              const seat = seats[index]
              if (seat.classList.contains("conf-step__chair_standart")) {
                return { type: "standart", price: 250 }
              } else if (seat.classList.contains("conf-step__chair_vip")) {
                return { type: "vip", price: 350 }
              }
            })

            const selectedSeatsDetails = selectedSeats.map((index) => {
              const rowNumber = Math.floor(index / hall.hall_places) + 1
              const seatNumber = (index % hall.hall_places) + 1
              return `${rowNumber}/${seatNumber}`
            })

            const totalCost = selectedSeatsInfo.reduce(
              (sum, seat) => sum + seat.price,
              0
            )

            const selectedSeatsHTML = selectedSeatsInfo
              .map(
                (seat, index) => `
        <p>Место ${selectedSeatsDetails[index]}: ${seat.type} (${seat.price} руб)</p>
      `
              )
              .join("")

            localStorage.setItem(
              "selectedSeatsInfo",
              JSON.stringify(selectedSeatsInfo)
            )
            localStorage.setItem(
              "selectedSeatsDetails",
              JSON.stringify(selectedSeatsDetails)
            )
            localStorage.setItem("totalCost", totalCost)
            window.location.href = "payment.html"
          })
        }
      })
      .catch((error) => {
        console.error("Error fetching hall configuration:", error)
      })
  }
})
