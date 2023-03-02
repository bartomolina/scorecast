import { IABCollection } from "../global";
import { useMemo, useState } from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { getABCollections } from "../lib/artblocks";
import Card from "../components/card";

type Props = {
  aBCollections: Array<IABCollection>;
};

const Home = ({ aBCollections }: Props) => {
  const [statusFilter, setStatusFilter] = useState("Completed");
  const [scriptFilter, setScriptFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const filteredCollections = useMemo(() => {
    let filteredCollections = [] as IABCollection[];
    if (aBCollections) {
      if (statusFilter === "Completed") {
        filteredCollections = aBCollections.filter((collection) => collection.complete);
      } else {
        filteredCollections = aBCollections.filter((collection) => !collection.complete && collection.active);
        if (statusFilter === "Upcoming") {
          filteredCollections = filteredCollections.filter(
            (collection) =>
              collection.mintingDate * 1000 > Date.now() || (!collection.mintingDate && !collection.activatedAt)
          );
        } else if (statusFilter === "Open") {
          filteredCollections = filteredCollections.filter(
            (collection) =>
              !collection.paused &&
              (collection.mintingDate * 1000 < Date.now() || (!collection.mintingDate && collection.activatedAt))
          );
        } else if (statusFilter === "Paused") {
          filteredCollections = filteredCollections.filter(
            (collection) =>
              collection.paused &&
              ((collection.mintingDate && collection.mintingDate * 1000 < Date.now()) ||
                (collection.activatedAt && collection.activatedAt * 1000 < Date.now()))
          );
        }
      }

      if (scriptFilter) {
        filteredCollections = filteredCollections.filter((collection) => collection.scriptType === scriptFilter);
      }

      if (searchFilter) {
        filteredCollections = filteredCollections.filter(
          (collection) =>
            collection.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
            collection.artistName.toLowerCase().includes(searchFilter.toLowerCase())
        );
      }
    }

    return filteredCollections;
  }, [aBCollections, statusFilter, scriptFilter, searchFilter]);

  const scriptTypes = useMemo(() => {
    return new Set(filteredCollections.map((c) => c.scriptType));
  }, [filteredCollections]);

  return (
    <>
      <Head>
        <title>ScoreCast.wtf</title>
        <meta name="description" content="ScoreCast" />
      </Head>
      <header className="mx-auto max-w-6xl px-6 lg:px-8 pt-4 pb-8">
        <h1 className="text-5xl font-thin leading-tight tracking-tight text-gray-900">Art Blocks</h1>
      </header>
      <div className="-mt-4 mx-auto max-w-6xl px-6 lg:px-8 pb-8 flex flex-wrap justify-between">
        <div className="mt-4">
          <label htmlFor="status" className="sr-only">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-base"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option>Completed</option>
            <option>Upcoming</option>
            <option>Open</option>
            <option>Paused</option>
          </select>
          <label htmlFor="library" className="sr-only">
            Library
          </label>
          <select
            id="library"
            name="scrlibraryipt"
            className="ml-5 rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-base"
            onChange={(event) => setScriptFilter(event.target.value)}
            value={scriptFilter}
          >
            <option value="">library</option>
            {scriptTypes &&
              [...Array.from(scriptTypes)].map((scriptType) => <option key={scriptType}>{scriptType}</option>)}
          </select>
          <em className="ml-5 text-lg sm:inline hidden">{`${filteredCollections.length} Collections`}</em>
        </div>
        <div className="mt-4">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="search"
              name="search"
              className="rounded-md border border-gray-300 py-2 pl-10 pr-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-base"
              onChange={(event) => setSearchFilter(event.target.value)}
              value={searchFilter}
            />
          </div>
        </div>
      </div>
      <div className="bg-gray-100 pb-14">
        <div className="mx-auto max-w-6xl sm:px-6 lg:px-8 py-6">
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {filteredCollections.map((collection) => (
              <Card key={collection.id} collection={collection} />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const data = await getABCollections();
  return {
    props: {
      aBCollections: data,
    },
    revalidate: 7 * 24 * 60 * 60,
  };
};

export default Home;
