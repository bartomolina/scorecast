import { useMemo, useState } from "react";
import Head from "next/head";
import { useScoreCast } from "../components/scorecast-context";
import FixturesTable from "../components/fixtures-table";

const Home = () => {
  const { fixtures: data } = useScoreCast();
  const [roundFilter, setRoundFilter] = useState("Regular Season - 25");

  const fixtures = useMemo(() => {
    let filteredFixtures = data || [];
    if (roundFilter) {
      return filteredFixtures.filter((f) => f.round === roundFilter);
    }
    return filteredFixtures;
  }, [data, roundFilter]);

  const rounds = useMemo(() => {
    if (data) {
      return new Set(data.map((f) => f.round));
    }
  }, [data]);

  return (
    <>
      <Head>
        <title>ScoreCast.wtf</title>
        <meta name="description" content="ScoreCast" />
      </Head>
      <header className="mx-auto max-w-6xl px-6 lg:px-8 py-10 text-center">
        <h1 className="text-5xl font-semibold leading-tight tracking-tight text-gray-900">Matches</h1>
        <div className="mt-4">
          <label htmlFor="round" className="sr-only">
            Round
          </label>
          <select
            id="round"
            name="status"
            className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-base"
            onChange={(event) => setRoundFilter(event.target.value)}
            value={roundFilter}
          >
            <option value="">round</option>
            {rounds && [...Array.from(rounds)].map((round) => <option key={round}>{round}</option>)}
          </select>
        </div>
      </header>
      <div className="pb-14">
        <div className="mx-auto max-w-6xl sm:px-6 lg:px-8 py-6">
          <FixturesTable fixtures={fixtures} />
        </div>
      </div>
    </>
  );
};

export default Home;
