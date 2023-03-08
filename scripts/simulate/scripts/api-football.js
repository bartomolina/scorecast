const id = args[0];

const url = "https://v3.football.api-sports.io/fixtures";

console.log(`HTTP GET Request to ${url}?id=${id}`);

const headers = {
  "x-rapidapi-host": "v3.football.api-sports.io",
  "x-rapidapi-key": args[1]
};

const APIFootballRequest = Functions.makeHttpRequest({
  url: url,
  headers,
  params: {
    id
  }
});

const APIFootballResponse = await APIFootballRequest;
if (APIFootballResponse.error) {
  console.error(APIFootballResponse.error);
  throw Error("Request failed");
}

const data = APIFootballResponse.data;
if ("Error" === data.Response) {
  console.error(data.Message)
  throw Error(`Functional error. Read message: ${data.Message}`);
}

const response = data.response[0];

console.log(response);

let result = 0;
if (response.fixture.status.short === "FT") {
  if (response.teams.home.winner) {
    result = 1;
  } else if (response.teams.away.winner) {
    result = 2;
  } else {
    retult = 3;
  }
}

return Functions.encodeUint256(result);