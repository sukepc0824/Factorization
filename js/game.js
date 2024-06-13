function keyup_event(e) {
    document.querySelector("[value='" + primes[keybind.indexOf(e.key)] + "']").style.filter = "brightness(100%)"
}

function keydown_event(e) {
    devide(primes[keybind.indexOf(e.key)])
    document.querySelector("[value='" + primes[keybind.indexOf(e.key)] + "']").style.filter = "brightness(90%)"
}

function gamestart() {
    primes = [2, 3, 5, 7, 11, 13]
    keybind = ["d", "f", "g", "h", "j", "k"]
    prime_list = [2, 3, 5, 7]
    prime_number = 1
    difficulty = 3
    score = 0
    if (localStorage.hasOwnProperty("name") && localStorage.getItem("name").length) {
        axios({
            method: "GET",
            url: "https://api.baserow.io/api/database/rows/table/308594/?user_field_names=true&search=" + localStorage.getItem("name"),
            headers: {
                Authorization: "Token N7q1jTTaOZ0cO6EpJ4cjf0DDJMJdQb01"
            },
        }).then(function (response) {
            if (response.data.results.length === 0) {
                max_score = 0
            } else {
                max_score = Math.max(...response.data.results.map(obj => obj.score))
            }
        })
    } else {
        max_score = 0
    }
    document.querySelector(".status-score").innerText = score
    create_buttons()
    generate_product()

    document.addEventListener('keyup', keyup_event)
    document.addEventListener('keydown', keydown_event)
}

function set_timer() {
    countDownSeconds = 31
    document.querySelector("progress").value = countDownSeconds
    countdown = setInterval(function () {
        countDownSeconds--
        document.querySelector("progress").value = countDownSeconds

        if (countDownSeconds === 0) {
            clearInterval(countdown)
            gameover()
        }
    }, 1000);
}

function gameover() {
    document.querySelector("dialog.gameover").showModal()
    document.querySelector(".score").innerText = score
    document.removeEventListener("keyup", keyup_event)
    document.removeEventListener("keydown", keydown_event)
    clearInterval(countdown)
    submit_userdata()
    document.querySelector(".high-score").innerText = max_score
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

function generate_product() {
    set_timer()
    for (let i = 0; i < difficulty ** 1.9 / 6; i++) {
        prime_number *= prime_list[Math.floor(Math.random() * (prime_list.length - 1) + 1)] * (Math.round(getRandomInt(difficulty) + 1))
    }
    document.querySelector("h1").remove()

    let element_button = document.createElement("h1")
    element_button.innerText = prime_number
    document.querySelector(".output").append(element_button)
}

function create_buttons() {
    document.querySelector(".container").innerHTML = ''
    prime_list.forEach((value, index) => {
        let element_button = document.createElement("button")
        element_button.innerText = value
        element_button.setAttribute("onclick", `devide(${value})`)
        element_button.value = value
        document.querySelector(".container").append(element_button)
    })
}

function devide(number) {
    if (prime_number % number == 0) {
        prime_number /= number
        score += Math.floor(number * difficulty / 3)
        document.querySelector(".status-score").innerText = score

        document.querySelector("h1").innerText = prime_number

        if (prime_number === 1) {
            difficulty += 0.25
            if (Number.isInteger(difficulty)) {
                document.querySelector("h1").innerText = "!"
                if (primes[difficulty] != undefined) {
                    prime_list.push(primes[difficulty])
                    create_buttons()
                }
            } else {
                document.querySelector("h1").innerText = "1"
            }

            clearInterval(countdown)

            window.setTimeout(generate_product, 340);
        }
    } else {
        gameover()
    }
}

function submit_userdata() {
    if (score === 0 || localStorage.getItem("name").length === 0) {
        return false
    }

    if (localStorage.hasOwnProperty("name")) {
        if (max_score < score) {
            axios({
                method: "GET",
                url: "https://api.baserow.io/api/database/rows/table/308594/?search=" + localStorage.getItem("name"),
                headers: {
                    Authorization: "Token N7q1jTTaOZ0cO6EpJ4cjf0DDJMJdQb01"
                }
            }).then(function (response) {
                response.data.results.forEach((value, index) => {
                    axios({
                        method: "DELETE",
                        url: "https://api.baserow.io/api/database/rows/table/308594/" + value.id + "/",
                        headers: {
                            Authorization: "Token N7q1jTTaOZ0cO6EpJ4cjf0DDJMJdQb01"
                        }
                    })
                })
            }).then(function (response) {
                axios({
                    method: "POST",
                    url: "https://api.baserow.io/api/database/rows/table/308594/?user_field_names=true",
                    headers: {
                        Authorization: "Token N7q1jTTaOZ0cO6EpJ4cjf0DDJMJdQb01",
                        "Content-Type": "application/json"
                    },
                    data: {
                        "user_name": localStorage.getItem("name"),
                        "score": score
                    }
                })
            })
        }
    }
}

gamestart()