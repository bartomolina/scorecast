const team = args[0]
const season = args[1]
const date = args[2]

// make HTTP request
const url = `https://v3.football.api-sports.io/fixtures`
console.log(`HTTP GET Request to ${url}?team=${team}&season=${season}&date=${date}`)

console.log("Secrets inside: ", secrets)

const headers = {
  'x-rapidapi-host': 'v3.football.api-sports.io',
  'x-rapidapi-key': secrets.rapidapikey
}

const APIFootballRequest = Functions.makeHttpRequest({
  url: url,
  headers,
  params: {
    team,
    season,
    date,
  },
})

// Execute the API request (Promise)
const APIFootballResponse = await APIFootballRequest
if (APIFootballResponse.error) {
  console.error(APIFootballResponse.error)
  throw Error("Request failed")
}

const data = APIFootballResponse["data"]
if (data.Response === "Error") {
  console.error(data.Message)
  throw Error(`Functional error. Read message: ${data.Message}`)
}

const response = data.response[0]

// Set result
let result = 0
if (response.teams.home.winner === true) {
  result = 1
} else if (response.teams.home.winner === false) {
  result = 2
}

return Functions.encodeUint256(result)