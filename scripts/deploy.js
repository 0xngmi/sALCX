const hre = require("hardhat");

async function main() {
  const sALCX = await hre.ethers.getContractFactory("sALCX");
  const salcx = await sALCX.deploy();
  await salcx.deployed();

  console.log("Deployed to:", salcx.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
