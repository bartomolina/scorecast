import { FormEvent, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import useSWR from "swr";
import axios from "axios";
import { useAccount } from "wagmi";
import { writeContract, waitForTransaction } from "@wagmi/core";
import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../../components/notifications-context";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const Match = () => {
  const router = useRouter();
  const { data } = useSWR("/api/getFixtures", fetcher);
  const { showNotification, showError } = useNotifications();
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingTx, setIsWaitingTx] = useState(false);

  const fixture = useMemo(() => {
    console.log(data);
    return data ? data.find((f) => f.id === parseInt(router.query.id as string)) : null;
  }, [data, router.isReady]);

  const clearForm = () => {
    // setMinter("");
  };

  const handleBet = (event: FormEvent, fixtureId: string, bet: string) => {
    if (fixture) {
      setIsLoading(true);
      writeContract({
        mode: "recklesslyUnprepared",
        address: "0x40Da6DdA6280E9A866031120fFFf0A8b9eeCf7C5",
        // @ts-ignore
        abi: "",
        functionName: "",
        args: [],
        overrides: {
          value: 1,
        },
      })
        // @ts-ignore
        .then((hash, wait) => {
          setIsWaitingTx(true);
          return waitForTransaction(hash);
        })
        .then((tx) => {
          setIsLoading(false);
          setIsWaitingTx(false);
          clearForm();
          // @ts-ignore
          console.log(tx);
          showNotification(
            "Minting completed",
            tx.hash,
            // @ts-ignore
            `https://testnets.opensea.io/assets/goerli/${collection._address}/${parseInt(tx.logs[0].topics[3], 16)}`,
            "View in OpenSea (you may get a 404, refresh after a few seconds)"
          );
        })
        .catch((error) => {
          setIsLoading(false);
          showError("Error minting", error.message);
        });
    }
  };

  return (
    <>
      <Head>
        <title>
          {fixture?.home.name} vs. {fixture?.away.name} - ScoreCast.io
        </title>
        <meta name="description" content="ScoreCast" />
      </Head>
      <header className="mx-auto max-w-6xl px-6 lg:px-8 pt-4 pb-8">
        <h1 className="text-5xl font-thin leading-tight tracking-tight text-gray-900">
          {fixture?.home.name} - {fixture?.away.name}
        </h1>
      </header>
      <div className="bg-gray-100 pb-14">
        <div className="mx-auto max-w-6xl sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-4 justify-items-center text-center items-center bg-white rounded p-14 shadow">
            <div>
              <div className="flex justify-center">
                <Image src={fixture.home.logo} alt={fixture.home.name} width={160} height={160} />
              </div>
              <div className="mt-10">
                <label htmlFor="homeBetAmount" className="sr-only">
                  Bet home team
                </label>
                <input
                  type="number"
                  id="homeBetAmount"
                  step="0.001"
                  className="h-14 w-28 font-medium rounded-lg text-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MATIC"
                  required
                ></input>
                <button
                  type="button"
                  onClick={(e) => handleBet(e, "home")}
                  className={
                    "ml-2 h-14 px-5 font-medium rounded-lg text-lg text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300"
                  }
                >
                  Bet
                </button>
              </div>
            </div>
            <div>
              <div className="text-gray-900 text-lg">
                <ClockIcon className="inline mr-1 h-4 w-4" />
                {new Date(fixture.date * 1000).toUTCString()}
              </div>
              <div className="text-gray-500">
                <MapPinIcon className="inline mr-1 h-4 w-4" />
                {fixture.venue}
              </div>
              <div
                className={`text-lg inline-block mt-6 px-2 rounded text-white ${
                  fixture.status === "Match Finished"
                    ? "bg-green-500"
                    : fixture.status === "First Half"
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
              >
                {fixture.status}
              </div>
            </div>
            <div>
              <div className="flex justify-center">
                <Image src={fixture.away.logo} alt={fixture.away.name} width={160} height={160} />
              </div>
              <div className="mt-10">
                <label htmlFor="homeBetAmount" className="sr-only">
                  Bet away team
                </label>
                <input
                  type="number"
                  id="homeBetAmount"
                  step="0.001"
                  className="h-14 w-28 font-medium rounded-lg text-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MATIC"
                  required
                ></input>
                <button
                  type="button"
                  onClick={(e) => handleBet(e, "away")}
                  className={
                    "ml-2 h-14 px-5 font-medium rounded-lg text-lg text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300"
                  }
                >
                  Bet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Match;
