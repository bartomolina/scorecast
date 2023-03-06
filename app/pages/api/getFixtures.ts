import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { resolve } from "path";
import axios from "axios";

const readFile = fs.promises.readFile;
const writeFile = fs.promises.writeFile;

const cacheFile = resolve("./data/cache");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let fixtures;

  const refreshCacheSeconds = 3 * 60 * 60; // 12 hours
  let refreshCache = false;

  if (fs.existsSync(cacheFile)) {
    const fileStats = fs.statSync(cacheFile);
    const secondsSinceLastUpdate = (new Date().getTime() - new Date(fileStats.mtime).getTime()) / 1000;
    console.log(`Seconds since cache update: ${secondsSinceLastUpdate}; refreshCacheSeconds: ${refreshCacheSeconds}`);

    if (secondsSinceLastUpdate > refreshCacheSeconds) {
      refreshCache = true;
    }

    // Fetch fixtures from cache
    if (!refreshCache) {
      try {
        fixtures = JSON.parse(await readFile(cacheFile, "utf8"));
        console.log("Successfully fetched collections from cache");
      } catch {
        console.log("No cached data found");
      }
    }
  }

  if (refreshCache) {
    axios
      .get("https://v3.football.api-sports.io/fixtures?season=2022&league=140", {
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        },
      })
      .then((response) => {
        let filteredFixtures = response.data.response.map((fixture) => {
          return {
            id: fixture.fixture.id,
            date: fixture.fixture.timestamp,
            venue: fixture.fixture.venue.name,
            status: fixture.fixture.status.long,
            round: fixture.league.round,
            home: {
              id: fixture.teams.home.id,
              name: fixture.teams.home.name,
              logo: fixture.teams.home.logo,
              winner: fixture.teams.home.winner,
              goals: fixture.goals.home,
            },
            away: {
              id: fixture.teams.away.id,
              name: fixture.teams.away.name,
              logo: fixture.teams.away.logo,
              winner: fixture.teams.away.winner,
              goals: fixture.goals.away,
            },
          };
        });
        writeFile(cacheFile, JSON.stringify(filteredFixtures), "utf8");
        fixtures = filteredFixtures;
      });
  }
  res.status(200).json(fixtures);
}
