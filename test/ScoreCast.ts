import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
const hre = require("hardhat");
const data = require("./testData.ts");

const placeBet = async (scoreCast, user, fixture, bet, value) => {
  const tx = await scoreCast
    .connect(user)
    .placeBet(
      fixture.fixtureId,
      bet,
      Math.floor(new Date(fixture.startDate).getTime() / 1000),
      Math.floor(new Date(fixture.endDate).getTime() / 1000),
      { value: hre.ethers.utils.parseEther(value.toString()) }
    );
  tx.wait();
};

describe("ScoreCast", function () {
  async function deployAndAddBetsScoreCastFixture() {
    const [user1, user2] = await hre.ethers.getSigners();
    const [fixture1, fixture2] = data;

    // Deploy proxy contract and create a new ScoreCast contract instance
    const ScoreCast = await hre.ethers.getContractFactory("ScoreCast");
    const scoreCast = await ScoreCast.deploy("0x0000000000000000000000000000000000000000");

    // Place bets
    await placeBet(scoreCast, user1, fixture1, "1", 0.5);
    await placeBet(scoreCast, user1, fixture1, "1", 1);
    await placeBet(scoreCast, user2, fixture1, "2", 1);

    return { scoreCast, user1, user2, fixture1, fixture2 };
  }
  describe("Verify fixture and bets creation", function () {
    it("Should create a fixture and bets", async function () {
      const { scoreCast, user1, user2, fixture1, fixture2 } = await loadFixture(deployAndAddBetsScoreCastFixture);

      // Check bets
      const currentBets = await scoreCast.getBets(fixture1.fixtureId);
      expect(currentBets[0]).to.eq(hre.ethers.utils.parseEther("1.5"));
      expect(currentBets[1]).to.eq(hre.ethers.utils.parseEther("1"));
    });
  });
  describe("Verify fixture and bets creation", function () {
    it("Should allow withdrawals", async function () {
      const { scoreCast, user1, user2, fixture1, fixture2 } = await loadFixture(deployAndAddBetsScoreCastFixture);

      let contractBalance = await hre.ethers.provider.getBalance(scoreCast.address);
      console.log("Contract balance before: ", hre.ethers.utils.formatEther(contractBalance));

      // Set result to "1" (home)
      const setResultTx = await scoreCast.setResult(fixture1.fixtureId, "1");
      setResultTx.wait();

      // Check account balance before and after withdrawal
      const before = await hre.ethers.provider.getBalance(user1.address);
      console.log("Balance before: ", hre.ethers.utils.formatEther(before));
      const withdrawTx = await scoreCast.connect(user1).withdraw(fixture1.fixtureId);
      withdrawTx.wait();
      console.log("test....");
      const after = await hre.ethers.provider.getBalance(user1.address);
      console.log("Balance after: ", hre.ethers.utils.formatEther(after));

      contractBalance = await hre.ethers.provider.getBalance(scoreCast.address);
      console.log("Contract balance after: ", hre.ethers.utils.formatEther(contractBalance));
    });
  });
});

// 1. Withdraw calculations
//    - Should allow withdraw only if finished
