import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
const data = require("./testData.ts");

describe("ScoreCast", function () {
  async function deployScoreCastFixture() {
    const [user1, user2] = await ethers.getSigners();

    // Deploy proxy contract and create a new ScoreCast contract instance
    const ScoreCast = await ethers.getContractFactory("ScoreCast");
    const scoreCast = await ScoreCast.deploy("0x0000000000000000000000000000000000000000");
    return { user1, user2, fixture1: data[0], fixture2: data[1], scoreCast };
  }
  describe("PlaceBet", function () {
    it("Should allow placing a bet", async function () {
      const { user1, user2, fixture1, fixture2, scoreCast } = await loadFixture(deployScoreCastFixture);

      // Place a bet with User 1
      const betTx = await scoreCast
        .connect(user1)
        .placeBet(
          fixture1.fixtureId,
          "1",
          Math.floor(new Date(fixture1.startDate).getTime() / 1000),
          Math.floor(new Date(fixture1.endDate).getTime() / 1000),
          { value: ethers.utils.parseEther("0.5") }
        );
      betTx.wait();
      // Place a bet with User 2
      const bet2Tx = await scoreCast
        .connect(user2)
        .placeBet(
          fixture1.fixtureId,
          "2",
          Math.floor(new Date(fixture1.startDate).getTime() / 1000),
          Math.floor(new Date(fixture1.endDate).getTime() / 1000),
          { value: ethers.utils.parseEther("1") }
        );
      bet2Tx.wait();

      // Check bets
      const currentBets = await scoreCast.getBets(fixture1.fixtureId);
      console.log(currentBets[0]);
      console.log(ethers.utils.parseEther("0.5"));

      expect(currentBets[0]).to.eq(ethers.utils.parseEther("0.5"));
      expect(currentBets[1]).to.eq(ethers.utils.parseEther("1"));
    });
    it("Should allow withdrawals for winners", async function () {
      const { user1, user2, fixture1, fixture2, scoreCast } = await loadFixture(deployScoreCastFixture);

      console.log(load)


      expect(1).to.eq(1);
    });
  });
});
