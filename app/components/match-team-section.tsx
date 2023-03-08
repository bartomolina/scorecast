import Image from "next/image";

const TeamSection = ({
  team,
  state,
  currentPool,
  side,
  isConnected,
  isLoading,
  isWaitingTx,
  handleFormChange,
  handleBet,
}) => {
  return (
    <div>
      <div className="flex justify-center">
        <Image src={team.logo} alt={team.name} width={160} height={160} quality={100} />
      </div>
      <div className="mt-6 space-y-7 text-gray-900">
        <div className="text-2xl flex justify-center text-center items-center">
          <Image src="/matic.png" alt="MATIC" width={30} height={30} />
          <div className="ml-2">{currentPool}</div>
        </div>
        {!isConnected ? (
          <div>Connect wallet to place a bet</div>
        ) : (
          <form action="#" method="POST">
            <label htmlFor={side} className="sr-only">
              {`Bet ${side} team`}
            </label>
            <input
              type="number"
              id={side}
              step="0.001"
              min="0"
              value={state}
              onChange={handleFormChange}
              className="h-10 w-28 font-medium rounded-lg text-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder="MATIC"
              required
            ></input>
            <button
              type="button"
              disabled={!isConnected || isLoading}
              onClick={(e) => handleBet(e, side === "home" ? "1" : "2")}
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
