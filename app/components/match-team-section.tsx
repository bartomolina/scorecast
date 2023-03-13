import { ITeamInfo } from "../global";
import { FormEvent, useMemo } from "react";
import Image from "next/image";
import { truncateEthAddress } from "../lib/utils";

type Props = {
  team: ITeamInfo;
  address: `0x${string}`;
  state: number;
  otherState: number;
  payout: number;
  totalBets: number;
  currentPool: number;
  otherPool: number;
  currentUser: number;
  currentUserClaimed: number;
  isPoolOpen: boolean;
  status: string;
  goals: number;
  result: number;
  side: "home" | "away";
  isConnected: boolean;
  isLoading: boolean;
  isWaitingTx: boolean;
  handleFormChange: (event: FormEvent<HTMLInputElement>) => void;
  handleBet: (event: FormEvent, bet: Number) => void;
  handleWithdrawal: (event: FormEvent) => void;
};

const TeamSection = ({
  team,
  address,
  state,
  otherState,
  payout,
  totalBets,
  currentPool,
  otherPool,
  currentUser,
  currentUserClaimed,
  isPoolOpen,
  status,
  goals,
  result,
  side,
  isConnected,
  isLoading,
  isWaitingTx,
  handleFormChange,
  handleBet,
  handleWithdrawal,
}: Props) => {
  const calculatedPayout = useMemo(() => {
    return (currentUser * (currentPool + otherPool)) / currentPool;
  }, [currentUser, currentPool, otherPool]);

  return (
    <div>
      <div className={`${side === "home" ? "flex-row-reverse " : ""}flex space-x-3 justify-center items-center`}>
        <div className={`text-8xl font-medium text-blue-900 p-3`}>{goals}</div>
        <Image src={team.logo} alt={team.name} width={160} height={160} quality={100} />
      </div>
      <div className="mt-5 text-gray-900">
        {isPoolOpen && (
          <>
            <div className="text-5xl font-medium text-gray-800 flex justify-center text-center items-center">
              <Image src="/matic.png" alt="MATIC" width={30} height={30} />
              <div className="ml-2">{currentPool}</div>
            </div>
            <div className="mt-1 text-xl flex justify-center text-center items-center">
              <span className="text-gray-500">payout</span>
              <span className={`ml-2${state || otherState ? " text-orange-500 font-medium" : ""}`}>{payout}x</span>
            </div>
            {isConnected && (
              <div className="mt-7 flex justify-center text-center items-center">
                <span>{truncateEthAddress(address)}</span>
                <span className={"ml-2"}>
                  <div className="flex justify-center text-center items-center">
                    <Image src="/matic.png" alt="MATIC" width={10} height={10} />
                    <div className="ml-0.5 font-semibold">{currentUser}</div>
                  </div>
                </span>
              </div>
            )}
            {currentUserClaimed === 0 &&
              currentUser > 0 &&
              ((result === 1 && side === "home") || (result === 2 && side === "away")) && (
                <button
                  type="button"
                  disabled={!isConnected || isLoading}
                  onClick={handleWithdrawal}
                  className={
                    "mt-3 h-10 px-2 font-medium rounded-lg text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300"
                  }
                >
                  <div className="flex justify-center text-center items-center">
                    <div>Claim</div>
                    <Image className="ml-2 mr-1" src="/matic.png" alt="MATIC" width={10} height={10} />
                    <div>{calculatedPayout}</div>
                  </div>
                </button>
              )}
            {currentUserClaimed != 0 && (
              <div className="flex justify-center text-center items-center">
                <Image src="/matic.png" alt="MATIC" width={10} height={10} />
                <div className="ml-0.5 font-semibold">{currentUserClaimed} Claimed!</div>
              </div>
            )}
          </>
        )}
        {isConnected && status === "Not Started" && (
          <form action="#" method="POST" className="mt-2">
            <label htmlFor={side} className="sr-only">
              {`Bet ${side} team`}
            </label>
            <input
              type="number"
              id={side}
              step="0.001"
              min="0"
              value={state ? state : ""}
              onChange={handleFormChange}
              className="h-10 w-28 font-medium rounded-lg text-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder="MATIC"
              required
            ></input>
            <button
              type="button"
              disabled={!isConnected || isLoading}
              onClick={(e) => handleBet(e, side === "home" ? 1 : 2)}
              className={
                "ml-2 h-10 px-5 font-medium rounded-lg text-lg text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300"
              }
            >
              Bet
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TeamSection;
