import { FormEvent, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import useSWR from "swr";
import axios from "axios";
import { BigNumber, ethers } from "ethers";
import { useAccount } from "wagmi";
import { writeContract, readContract, waitForTransaction } from "@wagmi/core";
import { MapPinIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../../components/notifications-context";
import ConsumerContractJSON from "../../lib/contracts/consumer-contract.json";
import TeamSection from "../../components/match-team-section";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const Match = () => {
  const router = useRouter();
  const { data } = useSWR("/api/getFixtures", fetcher);
  const [betData, setBetData] = useState({
    currentHome: "0",
    currentAway: "0",
    home: 0,
    away: 0,
    result: 0 as Number,
  });
  const [payout, setPayout] = useState({
    home: 0,
    away: 0,
    totalBets: 0,
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

  useEffect(() => {
    calculatePayout();
  }, [betData]);

  const handleFormChange = (event: FormEvent<HTMLInputElement>) => {
    setBetData({
      ...betData,
      [event.currentTarget.id]: parseFloat(event.currentTarget.value),
    });
  };

  const calculatePayout = () => {
    const homeBets = parseFloat(betData.currentHome) + betData.home;
    const awayBets = parseFloat(betData.currentAway) + betData.away;
    const totalBets = homeBets + awayBets;

    setPayout({
      home: homeBets ? parseFloat((totalBets / homeBets).toFixed(3)) : 0,
      away: awayBets ? parseFloat((totalBets / awayBets).toFixed(3)) : 0,
      totalBets: totalBets,
    });
  };

  const clearForm = () => {
    setBetData({
      ...betData,
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
      functionName: "getResult",
      // @ts-ignore
      args: [fixture.id.toString()],
    })
      .then((result) => {
        const verifiedResult = !isNaN(parseInt(result, 16)) ? parseInt(result, 16) : 0;
        readContract({
          // @ts-ignore
          address: ConsumerContractJSON.address,
          // @ts-ignore
          abi: ConsumerContractJSON.abi,
          functionName: "getBets",
          // @ts-ignore
          args: [fixture.id.toString()],
        }).then((result: any) => {
          setBetData({
            ...betData,
            currentHome: ethers.utils.formatEther(result[0]),
            currentAway: ethers.utils.formatEther(result[1]),
            result: verifiedResult,
          });
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

  const handleVerifyResult = (event: FormEvent) => {
    console.log([fixture.id.toString(), process.env.NEXT_PUBLIC_RAPIDAPI_KEY]);
    console.log(ConsumerContractJSON.address);
    if (fixture) {
      setIsLoading(true);
      writeContract({
        mode: "recklesslyUnprepared",
        address: ConsumerContractJSON.address,
        // @ts-ignore
        abi: ConsumerContractJSON.abi,
        functionName: "executeRequest",
        args: [[fixture.id.toString(), process.env.NEXT_PUBLIC_RAPIDAPI_KEY]],
        overrides: {
          gasLimit: BigNumber.from(5500000),
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
          showNotification("Verifying result. This may take a few seconds, come back later", tx.transactionHash);
        })
        .catch((error) => {
          setIsLoading(false);
          showError("Error verifying result", error.message);
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
          {fixture && (
            <>
              {fixture.home.name} - {fixture?.away.name}
            </>
          )}
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
                  payout: payout.home,
                  totalBets: payout.totalBets,
                  currentPool: betData.currentHome,
                  status: fixture.status,
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
                  className={`text-lg inline-block mt-4 px-2 rounded text-white ${
                    fixture.status === "Match Finished"
                      ? "bg-green-500"
                      : fixture.status === "First Half"
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                >
                  {fixture.status}
                </div>
                {!isConnected && (
                  <div className="mt-14 text-gray-700 text-lg font-semibold flex-col justify-center text-center items-center">
                    <ExclamationTriangleIcon className="inline mr-1 h-6 w-6 text-yellow-500" />
                    Connect your wallet to start betting
                  </div>
                )}
                {isConnected && fixture.status === "Not Started" && payout.totalBets === 0 && (
                  <div className="mt-14 text-gray-700 text-lg font-semibold flex-col justify-center text-center items-center">
                    <ExclamationTriangleIcon className="inline mr-1 h-6 w-6 text-yellow-500" />
                    No bets yet. Place a bet to start a pool
                  </div>
                )}
                {isConnected && fixture.status != "Not Started" && fixture.status != "Match Finished" && (
                  <div className="mt-14 text-gray-700 text-lg font-semibold flex-col justify-center text-center items-center">
                    <ExclamationTriangleIcon className="inline mr-1 h-6 w-6 text-yellow-500" />
                    You can't place any bets if the match is in progress
                  </div>
                )}
                {isConnected &&
                  fixture.status === "Match Finished" &&
                  betData.result === 0 &&
                  payout.totalBets != 0 && (
                    <>
                      <div className="mt-14 text-gray-700 text-lg font-semibold flex-col justify-center text-center items-center">
                        <ExclamationTriangleIcon className="inline mr-1 h-6 w-6 text-yellow-500" />
                        Match finished. Verify results onchain to claim your stake
                      </div>
                      <button
                        type="button"
                        disabled={!isConnected || isLoading}
                        onClick={handleVerifyResult}
                        className={
                          "mt-4 h-10 px-5 font-medium rounded-lg text-sm text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300"
                        }
                      >
                        Verity result on-chain
                      </button>
                    </>
                  )}
                {isConnected && fixture.status === "Match Finished" && betData.result != 0 && payout.totalBets != 0 && (
                  <div className="mt-14 text-gray-700 text-lg font-semibold flex-col justify-center text-center items-center">
                    <ExclamationTriangleIcon className="inline mr-1 h-6 w-6 text-yellow-500" />
                    Match finished. You can claim your stake
                  </div>
                )}
              </div>
              <TeamSection
                {...{
                  team: fixture.away,
                  state: betData.away,
                  payout: payout.away,
                  totalBets: payout.totalBets,
                  currentPool: betData.currentAway,
                  status: fixture.status,
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
