import { useMemo, useState } from "react";
import Head from "next/head";
import { useScoreCast } from "../components/scorecast-context";
import FixturesTable from "../components/fixtures-table";

const Pools = () => {
  const { fixtures: data } = useScoreCast();

  const fixtures = useMemo(() => {
    let filteredFixtures = data || [];
    return filteredFixtures.filter((f) => f.active === true);
  }, [data]);

  return (
    <>
      <Head>
        <title>ScoreCast.wtf</title>
        <meta name="description" content="ScoreCast" />
      </Head>
      <header className="mx-auto max-w-6xl px-6 lg:px-8 py-10 text-center">
        <h1 className="text-5xl font-semibold leading-tight tracking-tight text-gray-900">Pools</h1>
      </header>
      <div className="pb-14">
        <div className="mx-auto max-w-6xl sm:px-6 lg:px-8 py-6">
          <FixturesTable fixtures={fixtures} />
        </div>
      </div>
    </>
  );
};

export default Pools;
