document.addEventListener("DOMContentLoaded", function () {
  const daysContainer = document.querySelector(".page-nav")

  const daysOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
  const today = new Date()
  let currentDay = new Date(today)

  for (let i = 0; i < 6; i++) {
    const dayElement = document.createElement("a")
    dayElement.classList.add("page-nav__day")

    const dayIndex = currentDay.getDay()
    const dayName = daysOfWeek[dayIndex]
    const dayNumber = currentDay.getDate()

    if (currentDay.toDateString() === today.toDateString()) {
      // Check if the current day is today
      dayElement.innerHTML = `
        <span class="page-nav__day-number">Сегодня,</span>
        <span class="page-nav__day-number">${dayName}</span>
        <span class="page-nav__day-number">${dayNumber}</span>
      `
      dayElement.classList.add("page-nav__day_today") // You can add a custom class for styling
    } else {
      dayElement.innerHTML = `
        <span class="page-nav__day-week">${dayName}</span>
        <span class="page-nav__day-number">${dayNumber}</span>
      `
    }

    if (i === 0) {
      dayElement.classList.add("page-nav__day_chosen")
    }

    if (dayIndex === 0 || dayIndex === 6) {
      dayElement.classList.add("page-nav__day_weekend")
    }

    daysContainer.appendChild(dayElement)

    currentDay.setDate(currentDay.getDate() + 1)
  }
})
// задача 2 - 😎 распарсивание данных 1 страницы по фильам и расписанию
document.addEventListener("DOMContentLoaded", function () {
  const filmsContainer = document.querySelector(".movie")

  function fetchAndProcessData() {
    fetch("https://jscp-diplom.netoserver.ru/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "event=update",
    })
      .then((response) => response.json())
      .then((data) => {
        const films = data.films.result
        const seances = data.seances.result
        const halls = data.halls.result

        films.forEach((film) => {
          const filmElement = document.createElement("section")
          filmElement.classList.add("movie")

          const movieInfoElement = document.createElement("div")
          movieInfoElement.classList.add("movie__info")

          const moviePosterElement = document.createElement("div")
          moviePosterElement.classList.add("movie__poster")

          const filmPosterElement = document.createElement("img")
          filmPosterElement.src = film.film_poster
          filmPosterElement.alt = film.film_name
          filmPosterElement.classList.add("movie__poster-image")

          const movieDescriptionElement = document.createElement("div")
          movieDescriptionElement.classList.add("movie__description")

          const movieTitleElement = document.createElement("h2")
          movieTitleElement.classList.add("movie__title")
          movieTitleElement.textContent = film.film_name
          const seanceListElement = document.createElement("ul")
          seanceListElement.classList.add("movie__seance-list")

          seances.forEach((seance) => {
            if (seance.seance_filmid === film.film_id) {
              const seanceTimeElement = document.createElement("li")
              seanceTimeElement.classList.add("movie__seance-time")
              seanceTimeElement.textContent = seance.seance_time

              seanceTimeElement.addEventListener("click", () => {
                const selectedSeanceData = {
                  filmName: film.film_name,
                  seanceTime: seance.seance_time,
                  hallId: seance.seance_hallid,
                  seanceId: seance.seance_id,
                }

                localStorage.setItem(
                  "selectedSeance",
                  JSON.stringify(selectedSeanceData)
                )

                window.location.href = `hall.html`
              })

              seanceListElement.appendChild(seanceTimeElement)
            }
          })
          const movieSynopsisElement = document.createElement("p")
          movieSynopsisElement.classList.add("movie__synopsis")
          movieSynopsisElement.textContent = film.film_description

          const movieDataElement = document.createElement("p")
          movieDataElement.classList.add("movie__data")

          const movieDurationElement = document.createElement("span")
          movieDurationElement.classList.add("movie__data-duration")
          movieDurationElement.textContent = `${film.film_duration} минут`

          const movieOriginElement = document.createElement("span")
          movieOriginElement.classList.add("movie__data-origin")
          movieOriginElement.textContent = film.film_origin

          movieDescriptionElement.appendChild(movieTitleElement)
          movieDescriptionElement.appendChild(movieSynopsisElement)
          movieDataElement.appendChild(movieDurationElement)
          movieDataElement.appendChild(movieOriginElement)
          movieDescriptionElement.appendChild(movieDataElement)

          moviePosterElement.appendChild(filmPosterElement)
          movieInfoElement.appendChild(moviePosterElement)
          movieInfoElement.appendChild(movieDescriptionElement)

          filmElement.appendChild(movieInfoElement)

          halls.forEach((hall) => {
            const seancesForHallAndFilm = seances.filter(
              (seance) =>
                seance.seance_hallid === hall.hall_id &&
                seance.seance_filmid === film.film_id
            )

            if (seancesForHallAndFilm.length > 0) {
              const seancesHallElement = document.createElement("div")
              seancesHallElement.classList.add("movie-seances__hall")

              const hallTitleElement = document.createElement("h3")
              hallTitleElement.classList.add("movie-seances__hall-title")
              hallTitleElement.textContent = hall.hall_name

              const seancesListElement = document.createElement("ul")
              seancesListElement.classList.add("movie-seances__list")

              seancesForHallAndFilm.forEach((seance) => {
                const seanceTimeBlockElement = document.createElement("li")
                seanceTimeBlockElement.classList.add(
                  "movie-seances__time-block"
                )

                const seanceTimeLinkElement = document.createElement("a")
                seanceTimeLinkElement.classList.add("movie-seances__time")
                seanceTimeLinkElement.textContent = seance.seance_time

                const [hours, minutes] = seance.seance_time.split(":")
                const seanceTime = new Date()
                seanceTime.setHours(hours)
                seanceTime.setMinutes(minutes)

                const currentTime = new Date()

                if (currentTime > seanceTime) {
                  seanceTimeLinkElement.style.pointerEvents = "none"
                  seanceTimeLinkElement.style.color = "gray"
                } else {
                  seanceTimeLinkElement.addEventListener("click", () => {})
                }

                seanceTimeBlockElement.appendChild(seanceTimeLinkElement)
                seancesListElement.appendChild(seanceTimeBlockElement)
              })

              seancesHallElement.appendChild(hallTitleElement)
              seancesHallElement.appendChild(seancesListElement)
              filmElement.appendChild(seancesHallElement)
            }
          })

          filmsContainer.appendChild(filmElement)
        })
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
      })
  }

  fetchAndProcessData()
})
