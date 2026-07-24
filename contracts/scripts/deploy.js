const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  console.log(`\n=== Deploying to ${network} ===`);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // 1. Deploy RiderXPToken
  console.log("\n--- Deploying RiderXPToken ---");
  const RiderXPToken = await hre.ethers.getContractFactory("RiderXPToken");
  const token = await RiderXPToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("RiderXPToken deployed to:", tokenAddress);

  // 2. Deploy RiderRewardHub
  console.log("\n--- Deploying RiderRewardHub ---");
  const RiderRewardHub = await hre.ethers.getContractFactory("RiderRewardHub");
  const hub = await RiderRewardHub.deploy(tokenAddress, deployer.address);
  await hub.waitForDeployment();
  const hubAddress = await hub.getAddress();
  console.log("RiderRewardHub deployed to:", hubAddress);

  // 3. CRITICAL: Transfer token ownership to Hub
  console.log("\n--- Transferring token ownership to Hub ---");
  const ownershipTx = await token.transferOwnership(hubAddress);
  await ownershipTx.wait();
  console.log("Ownership transferred. Hub is now token owner.");

  // 4. Verify ownership
  const newOwner = await token.owner();
  console.log("Token owner:", newOwner, newOwner === hubAddress ? "✓ MATCH" : "✗ MISMATCH!");

  // 5. Save deployment info
  const deployment = {
    network,
    chainId: network === "fuji" ? 43113 : 31337,
    deployer: deployer.address,
    token: tokenAddress,
    hub: hubAddress,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const outDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `${network}-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));
  console.log("\nDeployment saved to:", outFile);

  // 6. Print summary for copy-paste
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(`NETWORK=${network}`);
  console.log(`TOKEN_CONTRACT_ADDRESS=${tokenAddress}`);
  console.log(`HUB_CONTRACT_ADDRESS=${hubAddress}`);
  console.log(`DEPLOYER_ADDRESS=${deployer.address}`);

  if (network === "fuji") {
    console.log("\n=== NEXT STEPS ===");
    console.log("1. Add addresses to backend .env");
    console.log("2. Run verification: npx hardhat run scripts/verify.js --network fuji");
    console.log("3. Check on Snowtrace: https://testnet.snowtrace.io");
  }

  return deployment;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });