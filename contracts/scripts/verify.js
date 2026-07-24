const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  console.log(`\n=== Verifying contracts on ${network} ===`);

  // Find latest deployment file
  const deployDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deployDir)) {
    console.error("No deployments directory found. Run deploy first.");
    process.exit(1);
  }

  const files = fs.readdirSync(deployDir)
    .filter(f => f.startsWith(network))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error(`No deployment found for ${network}`);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(path.join(deployDir, files[0])));
  console.log("Using deployment:", deployment.token, deployment.hub);

  // Verify RiderXPToken
  console.log("\n--- Verifying RiderXPToken ---");
  try {
    await hre.run("verify:verify", {
      address: deployment.token,
      constructorArguments: [deployment.deployer]
    });
    console.log("✓ RiderXPToken verified");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✓ RiderXPToken already verified");
    } else {
      console.error("✗ Token verification failed:", error.message);
    }
  }

  // Verify RiderRewardHub
  console.log("\n--- Verifying RiderRewardHub ---");
  try {
    await hre.run("verify:verify", {
      address: deployment.hub,
      constructorArguments: [deployment.token, deployment.deployer]
    });
    console.log("✓ RiderRewardHub verified");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✓ RiderRewardHub already verified");
    } else {
      console.error("✗ Hub verification failed:", error.message);
    }
  }

  console.log("\n=== Verification complete ===");
  console.log(`Check on Snowtrace:`);
  console.log(`  Token: https://testnet.snowtrace.io/address/${deployment.token}`);
  console.log(`  Hub:   https://testnet.snowtrace.io/address/${deployment.hub}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });