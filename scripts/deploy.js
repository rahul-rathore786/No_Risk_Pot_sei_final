const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy SeiToken
  const SeiToken = await hre.ethers.getContractFactory("SeiToken");
  const seiToken = await SeiToken.deploy();
  await seiToken.deployed();
  console.log("SeiToken deployed to:", seiToken.address);

  // Deploy ZeroLossLottery with SeiToken address
  const ZeroLossLottery = await hre.ethers.getContractFactory(
    "ZeroLossLottery"
  );
  const zeroLossLottery = await ZeroLossLottery.deploy(seiToken.address);
  await zeroLossLottery.deployed();
  console.log("ZeroLossLottery deployed to:", zeroLossLottery.address);

  // Write contract addresses to frontend
  const contractAddresses = {
    ZeroLossLottery: zeroLossLottery.address,
    SEI: seiToken.address,
  };

  const addressesDir = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts"
  );
  fs.writeFileSync(
    path.join(addressesDir, "addresses.json"),
    JSON.stringify(contractAddresses, null, 2)
  );

  console.log("Contract addresses updated in frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
