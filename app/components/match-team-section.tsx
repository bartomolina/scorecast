import { useMemo } from "react";
import Image from "next/image";
import { truncateEthAddress } from "../lib/utils";

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
  isPoolOpen,
  status,
  result,
  side,
  isConnected,
  isLoading,
  isWaitingTx,
  handleFormChange,
  handleBet,
  handleWithdrawal,
}) => {
  const calculatedPayout = useMemo(() => {
    return (currentUser * (currentPool + otherPool)) / currentPool;
  }, [currentUser, currentPool, otherPool]);

  return (
    <div>
      <div className="flex justify-center">
        <Image src={team.logo} alt={team.name} width={160} height={160} quality={100} />
      </div>
      <div className="mt-5 text-gray-900">
        {(false || (isConnected && isPoolOpen)) && (
          <>
            <div className="text-4xl flex justify-center text-center items-center">
              <Image src="/matic.png" alt="MATIC" width={30} height={30} />
              <div className="ml-2">{currentPool}</div>
            </div>
            <div className="mt-1 text-xl flex justify-center text-center items-center">
              <span className="text-gray-500">payout</span>
              <span className={`ml-2${state || otherState ? " text-orange-500 font-medium" : ""}`}>{payout}x</span>
            </div>
            <div className="mt-7 flex justify-center text-center items-center">
              <span>{truncateEthAddress(address)}</span>
              <span className={"ml-2"}>
                <div className="flex justify-center text-center items-center">
                  <Image src="/matic.png" alt="MATIC" width={10} height={10} />
                  <div className="ml-0.5">{currentUser}</div>
                </div>
              </span>
            </div>
            {(false ||
              (currentUser > 0 && ((result === 1 && side === "home") || (result === 2 && side === "away")))) && (
              <button
                type="button"
                disabled={!isConnected || isLoading}
                onClick={handleWithdrawal}
                className={
                  "mt-2 h-8 px-2 font-medium rounded-lg text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300"
                }
              >
                <div className="flex justify-center text-center items-center">
                  <div>Claim</div>
                  <Image className="ml-2 mr-1" src="/matic.png" alt="MATIC" width={10} height={10} />
                  <div>{calculatedPayout}</div>
                </div>
              </button>
            )}
          </>
        )}
        {(true || (isConnected && status != "Match Finished")) && (
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
