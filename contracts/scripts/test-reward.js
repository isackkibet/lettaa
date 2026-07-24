const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`\n=== Testing reward distribution on ${network} ===`);

  // Get latest deployment
  const fs = require("fs");
  const path = require("path");
  const deployDir = path.join(__dirname, "..", "deployments");

  const files = fs.readdirSync(deployDir)
    .filter(f => f.startsWith(network))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error("No deployment found. Run deploy first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(path.join(deployDir, files[0])));
  console.log("Using Hub:", deployment.hub);
  console.log("Using Token:", deployment.token);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Operator:", deployer.address);

  // Get contracts
  const hub = await hre.ethers.getContractAt("RiderRewardHub", deployment.hub);
  const token = await hre.ethers.getContractAt("RiderXPToken", deployment.token);

  // Test rider address (use a test address or deployer for self-test)
  const testRider = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Hardhat test account #1
  const amount = 100;
  const reason = "test_reward_" + Date.now();

  console.log(`\nDistributing ${amount} RXP to ${testRider} for "${reason}"`);

  const tx = await hub.distributeReward(testRider, amount, reason);
  console.log("Transaction sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("Confirmed in block:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());
  console.log("Status:", receipt.status === 1 ? "SUCCESS" : "FAILED");

  // Check event
  const event = receipt.logs
    .map(l => {
      try { return hub.interface.parseLog(l); } catch { return null; }
    })
    .find(e => e && e.name === "RewardDistributed");

  if (event) {
    console.log("\nEvent emitted:");
    console.log("  Rider:", event.args.rider);
    console.log("  Amount:", event.args.amount.toString());
    console.log("  Reason:", event.args.reason);
  }

  // Check balance
  const balance = await token.balanceOf(testRider);
  console.log(`\nRider balance: ${balance.toString()} RXP`);

  // Check Snowtrace link
  if (network === "fuji") {
    console.log(`\nView on Snowtrace:`);
    console.log(`  https://testnet.snowtrace.io/tx/${tx.hash}`);
  }

  console.log("\n✓ Test complete");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });