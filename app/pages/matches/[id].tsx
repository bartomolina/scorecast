import { IFixture } from "../../global";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import axios from "axios";
import { BigNumber, ethers } from "ethers";
import { useAccount } from "wagmi";
import { writeContract, readContract, waitForTransaction } from "@wagmi/core";
import Image from "next/image";
import { MapPinIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../../components/notifications-context";
import ConsumerContractJSON from "../../lib/contracts/consumer-contract.json";
import TeamSection from "../../components/match-team-section";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const Match = () => {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const { data } = useSWR("/api/getFixtures", fetcher);
  const [onChainInfo, setOnChainInfo] = useState({
    dates: {
      startTime: 0,
      endTime: 0,
    },
    totalBets: {
      home: 0,
      away: 0,
    },
    ownBets: {
      home: 0,
      away: 0,
      claimed: {
        home: 0,
        away: 0,
      },
    },
    result: 0,
  });
  const [betData, setBetData] = useState({
    home: 0,
    away: 0,
  });
  const [payout, setPayout] = useState({
    home: 0,
    away: 0,
    totalBets: 0,
  });
  const { showNotification, showError } = useNotifications();
  const { isConnected, address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingTx, setIsWaitingTx] = useState(false);

  const userAddress = useMemo(() => {
    return address ? address : "0x0000000000000000000000000000000000000000";
  }, [address]);

  const isPoolOpen = useMemo(() => {
    return onChainInfo.totalBets.home > 0 || onChainInfo.totalBets.away > 0;
  }, [onChainInfo]);

  const fixture = useMemo(() => {
    return data ? data.find((f: IFixture) => f.id === parseInt(router.query.id as string)) : null;
  }, [data, router.query.id]);

  useEffect(() => {
    if (fixture) {
      getMatchData();
    }
  }, [fixture, address]);

  useEffect(() => {
    calculatePayout();
  }, [betData, onChainInfo]);

  const handleFormChange = (event: FormEvent<HTMLInputElement>) => {
    let value = parseFloat(event.currentTarget.value);
    value = isNaN(value) ? 0 : value;
    setBetData({
      ...betData,
      [event.currentTarget.id]: value,
    });
  };

  const calculatePayout = () => {
    const homeBets = onChainInfo.totalBets.home + betData.home;
    const awayBets = onChainInfo.totalBets.away + betData.away;
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
      functionName: "getFixtureData",
      // @ts-ignore
      args: [fixture.id.toString(), ethers.utils.getAddress(userAddress)],
    })
      .then((result: any) => {
        console.log(result);
        setOnChainInfo({
          dates: {
            startTime: result.fixtureInfo.startTime.toNumber(),
            endTime: result.fixtureInfo.endTime.toNumber(),
          },
          totalBets: {
            home: parseFloat(ethers.utils.formatEther(result.totalHome)),
            away: parseFloat(ethers.utils.formatEther(result.totalAway)),
          },
          ownBets: {
            home: parseFloat(ethers.utils.formatEther(result.ownHome)),
            away: parseFloat(ethers.utils.formatEther(result.ownAway)),
            claimed: {
              home: parseFloat(ethers.utils.formatEther(result.ownHomeClaimed)),
              away: parseFloat(ethers.utils.formatEther(result.ownAwayClaimed)),
            },
          },
          result: !isNaN(parseInt(result.result, 16)) ? parseInt(result.result, 16) : 0,
        });
      })
      .catch((error) => {
        console.log(error);
        showError("Error fetching Bet data", error.message);
      });
  };

  const handleBet = (event: FormEvent, bet: Number) => {
    event.preventDefault();
    const betAmount = bet === 1 ? betData.home : betData.away;

    if (fixture) {
      setIsLoading(true);
      writeContract({
        mode: "recklesslyUnprepared",
        address: ConsumerContractJSON.address,
        // @ts-ignore
        abi: ConsumerContractJSON.abi,
        functionName: "placeBet",
        args: [fixture.id.toString(), bet, fixture.date, fixture.date + 2.5 * 60 * 60],
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
          getMatchData();
          calculatePayout();
        })
        .catch((error) => {
          setIsLoading(false);
          showError("Error placing bet", error.message);
        });
    }
  };

  const handleWithdrawal = (event: FormEvent) => {
    event.preventDefault();
    if (fixture) {
      setIsLoading(true);
      writeContract({
        mode: "recklesslyUnprepared",
        address: ConsumerContractJSON.address,
        // @ts-ignore
        abi: ConsumerContractJSON.abi,
        functionName: "withdraw",
        args: [fixture.id.toString()],
      })
        // @ts-ignore
        .then((hash, wait) => {
          setIsWaitingTx(true);
          return waitForTransaction(hash);
        })
        .then((tx) => {
          setIsLoading(false);
          setIsWaitingTx(false);
          // @ts-ignore
          showNotification("Claim completed", tx.transactionHash);
          getMatchData();
        })
        .catch((error) => {
          setIsLoading(false);
          showError("Error claiming funds", error.message);
        });
    }
  };

  const handleVerifyResult = (event: FormEvent) => {
    event.preventDefault();
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
          getMatchData();
        })
        .catch((error) => {
          setIsLoading(false);
          showError("Error verifying result", error.message);
        });
    }
  };

  // To prevent hydration errors:
  // https://codingwithmanny.medium.com/understanding-hydration-errors-in-nextjs-13-with-a-web3-wallet-connection-8155c340fbd5
  // https://www.joshwcomeau.com/react/the-perils-of-rehydration/#the-solution
  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true);
    }
  }, [hasMounted]);
  if (!hasMounted) return null;

  return (
    <>
      <Head>
        <title>{fixture ? `${fixture.home.name} vs. ${fixture.away.name} - ScoreCast.io` : ""}</title>
        <meta name="description" content="ScoreCast" />
      </Head>
      <header className="mx-auto max-w-6xl px-6 lg:px-8 py-10 text-center">
        <h1 className="text-5xl font-semibold leading-tight tracking-tight text-gray-900">
          {fixture && (
            <>
              {fixture.home.name} - {fixture?.away.name}
            </>
          )}
        </h1>
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
              : fixture.status === "First Half" || fixture.status === "Second Half"
              ? "bg-orange-500"
              : "bg-red-500"
          }`}
        >
          {fixture.status}
        </div>
      </header>
      <div className="pb-14">
        {fixture && (
          <div className="mx-auto max-w-6xl sm:px-6 lg:px-8 py-4">
            <div className="flex p-2 items-center rounded-lg bg-gradient-to-br from-green-400 to-blue-600 shadow-md">
              <div className="grid grid-cols-3 gap-4 justify-items-center text-center items-center bg-white py-14 rounded-md h-full w-full">
                <TeamSection
                  {...{
                    team: fixture.home,
                    address: userAddress,
                    state: betData.home,
                    otherState: betData.away,
                    payout: payout.home,
                    totalBets: payout.totalBets,
                    currentPool: onChainInfo.totalBets.home,
                    otherPool: onChainInfo.totalBets.away,
                    currentUser: onChainInfo.ownBets.home,
                    currentUserClaimed: onChainInfo.ownBets.claimed.home,
                    isPoolOpen,
                    status: fixture.status,
                    result: onChainInfo.result,
                    side: "home",
                    isConnected,
                    isLoading,
                    isWaitingTx,
                    handleFormChange,
                    handleBet,
                    handleWithdrawal,
                  }}
                />
                <div>
                  {!isConnected && (
                    <div className="text-gray-700 text-lg font-semibold flex-col justify-center text-center items-center">
                      <ExclamationTriangleIcon className="inline mr-1 h-6 w-6 text-yellow-500" />
                      Connect your wallet to start betting
                    </div>
                  )}
                  {isConnected && fixture.status === "Not Started" && !isPoolOpen && (
                    <div className="text-gray-700 text-lg font-semibold flex-col justify-center text-center items-center">
                      <ExclamationTriangleIcon className="inline mr-1 h-6 w-6 text-yellow-500" />
                      No bets yet. Place a bet to start a pool
                    </div>
                  )}
                  {isConnected && fixture.status != "Not Started" && fixture.status != "Match Finished" && (
                    <div className="text-gray-700 text-lg font-semibold flex-col justify-center text-center items-center">
                      <ExclamationTriangleIcon className="inline mr-1 h-6 w-6 text-yellow-500" />
                      You can&apos;t place any bets if the match is in progress
                    </div>
                  )}
                  {(true ||
                    (isConnected && fixture.status === "Match Finished" && onChainInfo.result === 0 && isPoolOpen)) && (
                    <div className="divide-y divide-blue-600 w-full border text-blue-900 mt-7 py-4 rounded border-blue-600 bg-blue-50">
                      <div className="flex justify-center text-center items-center">
                        <Image src="/functions.png" className="mr-3" alt="Chainlink functions" width={20} height={20} />
                        Verified on-chain data
                      </div>
                      <div className="mt-4 px-4 pt-4 space-y-2">
                        <div>
                          <div className="font-semibold text-sm">Start time</div>
                          <div className="-mt-0.5">{new Date(onChainInfo.dates.startTime * 1000).toUTCString()}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">End time</div>
                          <div className="-mt-0.5">{new Date(onChainInfo.dates.endTime * 1000).toUTCString()}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Result</div>
                          {fixture.status === "Match Finished" && onChainInfo.result === 0 && (
                            <button
                              type="button"
                              disabled={!isConnected || isLoading}
                              onClick={handleVerifyResult}
                              className={
                                "h-8 px-2 font-medium rounded-lg text-sm text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300"
                              }
                            >
                              Verify result on-chain
                            </button>
                          )}
                          {fixture.status != "Match Finished" && (
                            <div className="-mt-0.5">Waiting until match finishes</div>
                          )}
                          {fixture.status === "Match Finished" && onChainInfo.result != 0 && (
                            <div className="-mt-0.5 flex justify-center text-center items-center">
                              <Image
                                className="mr-0.5"
                                src={
                                  onChainInfo.result === 1
                                    ? fixture.home.logo
                                    : onChainInfo.result === 2
                                    ? fixture.away.logo
                                    : onChainInfo.result === 3
                                    ? "Draw"
                                    : "Error"
                                }
                                alt={
                                  onChainInfo.result === 1
                                    ? fixture.home.name
                                    : onChainInfo.result === 2
                                    ? fixture.away.name
                                    : onChainInfo.result === 3
                                    ? "Draw"
                                    : "Error"
                                }
                                width={18}
                                height={18}
                              />
                              Won
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <TeamSection
                  {...{
                    team: fixture.away,
                    address: userAddress,
                    state: betData.away,
                    otherState: betData.home,
                    payout: payout.away,
                    totalBets: payout.totalBets,
                    currentPool: onChainInfo.totalBets.away,
                    otherPool: onChainInfo.totalBets.home,
                    currentUser: onChainInfo.ownBets.away,
                    currentUserClaimed: onChainInfo.ownBets.claimed.away,
                    isPoolOpen,
                    status: fixture.status,
                    result: onChainInfo.result,
                    side: "away",
                    isConnected,
                    isLoading,
                    isWaitingTx,
                    handleFormChange,
                    handleBet,
                    handleWithdrawal,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Match;
