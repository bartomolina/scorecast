import { FormEvent, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import useSWR from "swr";
import axios from "axios";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { writeContract, readContract, waitForTransaction } from "@wagmi/core";
import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../../components/notifications-context";
import ConsumerContractJSON from "../../lib/contracts/consumer-contract.json";
import TeamSection from "../../components/match-team-section";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const Match = () => {
  const router = useRouter();
  const { data } = useSWR("/api/getFixtures", fetcher);
  const [betData, setBetData] = useState({
    currentHome: "",
    currentAway: "",
    home: null,
    away: null,
  });
  const { showNotification, showError } = useNotifications();
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingTx, setIsWaitingTx] = useState(false);

  const fixture = useMemo(() => {
    return data ? data.find((f) => f.id === parseInt(router.query.id as string)) : null;
  }, [data, router.isReady]);

  useEffect(() => {
    if (fixture) {
      getMatchData();
    }
  }, [fixture]);

  const handleFormChange = (event: FormEvent<HTMLInputElement>) => {
    setBetData({
      ...betData,
      [event.currentTarget.id]: event.currentTarget.value,
    });
  };

  const clearForm = () => {
    setBetData({
      currentHome: "",
      currentAway: "",
      home: 0,
      away: 0,
    });
  };

  const getMatchData = () => {
    readContract({
      // @ts-ignore
      address: ConsumerContractJSON.address,
      // @ts-ignore
      abi: ConsumerContractJSON.abi,
      functionName: "getBets",
      // @ts-ignore
      args: [fixture.id.toString()],
    })
      .then((result: any) => {
        setBetData({
          ...betData,
          currentHome: ethers.utils.formatEther(result[0]),
          currentAway: ethers.utils.formatEther(result[1]),
        });
      })
      .catch((error) => {
        console.log(error);
        showError("Error fetching Bet data", error.message);
      });
  };

  const handleBet = (event: FormEvent, bet: string) => {
    const betAmount = bet === "1" ? betData.home : betData.away;

    if (fixture) {
      setIsLoading(true);
      writeContract({
        mode: "recklesslyUnprepared",
        address: ConsumerContractJSON.address,
        // @ts-ignore
        abi: ConsumerContractJSON.abi,
        functionName: "placeBet",
        args: [fixture.id.toString(), bet],
        overrides: {
          value: ethers.utils.parseEther(betAmount.toString()),
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
          showNotification("Bet placed", tx.transactionHash);
        })
        .catch((error) => {
          setIsLoading(false);
          showError("Error placing bet", error.message);
        });
    }
  };

  return (
    <>
      <Head>
        <title>{fixture ? `${fixture.home.name} vs. ${fixture.away.name}` : ""} - ScoreCast.io</title>
        <meta name="description" content="ScoreCast" />
      </Head>
      <header className="mx-auto max-w-6xl px-6 lg:px-8 pt-4 pb-8">
        <h1 className="text-5xl font-thin leading-tight tracking-tight text-gray-900">
          {fixture?.home.name} - {fixture?.away.name}
        </h1>
      </header>
      <div className="bg-gray-100 pb-14">
        {fixture && (
          <div className="mx-auto max-w-6xl sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-3 gap-4 justify-items-center text-center items-center bg-white rounded p-14 shadow">
              <TeamSection
                {...{
                  team: fixture.home,
                  state: betData.home,
                  currentPool: betData.currentHome,
                  side: "home",
                  isConnected,
                  isLoading,
                  isWaitingTx,
                  handleFormChange,
                  handleBet,
                }}
              />
              <div>
                <div className="text-lg text-gray-900 flex justify-center text-center items-center">
                  <ClockIcon className="inline mr-1 h-4 w-4" />
                  {new Date(fixture.date * 1000).toUTCString()}
                </div>
                <div className="text-gray-500  flex justify-center text-center items-center">
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
              <TeamSection
                {...{
                  team: fixture.away,
                  state: betData.away,
                  currentPool: betData.currentAway,
                  side: "away",
                  isConnected,
                  isLoading,
                  isWaitingTx,
                  handleFormChange,
                  handleBet,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Match;
