const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RiderXPToken & RiderRewardHub", function () {
  let token, hub, deployer, operator, rider1, rider2;

  beforeEach(async function () {
    [deployer, operator, rider1, rider2] = await ethers.getSigners();

    // Deploy token
    const Token = await ethers.getContractFactory("RiderXPToken");
    token = await Token.deploy(deployer.address);
    await token.waitForDeployment();

    // Deploy hub
    const Hub = await ethers.getContractFactory("RiderRewardHub");
    hub = await Hub.deploy(await token.getAddress(), operator.address);
    await hub.waitForDeployment();

    // Transfer token ownership to hub
    await (await token.transferOwnership(await hub.getAddress())).wait();
  });

  describe("RiderXPToken", function () {
    it("has correct name, symbol, decimals", async function () {
      expect(await token.name()).to.equal("Rider XP Token");
      expect(await token.symbol()).to.equal("RXP");
      expect(await token.decimals()).to.equal(0);
    });

    it("starts with zero supply", async function () {
      expect(await token.totalSupply()).to.equal(0);
    });

    it("only owner can mint", async function () {
      await expect(token.mintReward(rider1.address, 100)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("owner can mint rewards", async function () {
      await token.mintReward(rider1.address, 100);
      expect(await token.balanceOf(rider1.address)).to.equal(100);
    });

    it("rejects zero address and zero amount", async function () {
      await expect(token.mintReward(ethers.ZeroAddress, 100)).to.be.revertedWith("zero address");
      await expect(token.mintReward(rider1.address, 0)).to.be.revertedWith("zero amount");
    });
  });

  describe("RiderRewardHub", function () {
    it("sets correct token and operator", async function () {
      expect(await hub.token()).to.equal(await token.getAddress());
      expect(await hub.operator()).to.equal(operator.address);
    });

    it("only operator can distribute rewards", async function () {
      await expect(hub.distributeReward(rider1.address, 100, "test")).to.be.revertedWith("not authorized");
    });

    it("operator can distribute rewards", async function () {
      const hubAsOperator = hub.connect(operator);
      await expect(hubAsOperator.distributeReward(rider1.address, 100, "level_up_5"))
        .to.emit(hub, "RewardDistributed")
        .withArgs(rider1.address, 100, "level_up_5");

      expect(await token.balanceOf(rider1.address)).to.equal(100);
    });

    it("rejects invalid parameters", async function () {
      const hubAsOperator = hub.connect(operator);
      await expect(hubAsOperator.distributeReward(ethers.ZeroAddress, 100, "test")).to.be.revertedWith("zero address");
      await expect(hubAsOperator.distributeReward(rider1.address, 0, "test")).to.be.revertedWith("zero amount");
      await expect(hubAsOperator.distributeReward(rider1.address, 100, "")).to.be.revertedWith("empty reason");
    });

    it("emits event with correct data", async function () {
      const hubAsOperator = hub.connect(operator);
      const tx = await hubAsOperator.distributeReward(rider1.address, 250, "mission_daily_5");
      const receipt = await tx.wait();

      const event = receipt.logs
        .map(l => {
          try { return hub.interface.parseLog(l); } catch { return null; }
        })
        .find(e => e && e.name === "RewardDistributed");

      expect(event).to.not.be.null;
      expect(event.args.rider).to.equal(rider1.address);
      expect(event.args.amount).to.equal(250);
      expect(event.args.reason).to.equal("mission_daily_5");
    });

    it("can update operator", async function () {
      await expect(hub.setOperator(rider2.address))
        .to.not.be.reverted;
      expect(await hub.operator()).to.equal(rider2.address);
    });

    it("non-operator cannot update operator", async function () {
      await expect(hub.connect(rider1).setOperator(rider2.address))
        .to.be.revertedWith("not authorized");
    });
  });

  describe("Integration: multiple rewards", function () {
    it("accumulates rewards correctly", async function () {
      const hubAsOperator = hub.connect(operator);

      await hubAsOperator.distributeReward(rider1.address, 100, "level_up_1");
      await hubAsOperator.distributeReward(rider1.address, 200, "level_up_2");
      await hubAsOperator.distributeReward(rider1.address, 50, "mission_weekly_1");

      expect(await token.balanceOf(rider1.address)).to.equal(350);

      // Second rider
      await hubAsOperator.distributeReward(rider2.address, 500, "champion_reward");
      expect(await token.balanceOf(rider2.address)).to.equal(500);
    });
  });
});