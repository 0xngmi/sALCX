const { expect } = require("chai");
const { ethers } = require("hardhat");

const alcxWhaleAddress = "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2" // pls gib coins sam-kun
const secondsDay = 3600*24;

function e18(v){
  return ethers.utils.parseEther(v.toString())
}

describe("sALCX", function () {
  it("works", async function () {
    this.timeout(50000);
    const [alice, bob, charlie] = await ethers.getSigners();
    const sALCX = await hre.ethers.getContractFactory("sALCX");
    const salcx = await sALCX.deploy();
    await salcx.deployed();

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [alcxWhaleAddress],
    });
    const alcxWhale = await ethers.provider.getSigner(
      alcxWhaleAddress
    );

    const alcx = new ethers.Contract(
      "0xdbdb4d16eda451d0503b854cf79d55697f90c8df",
      [
        'function balanceOf(address account) public view returns (uint256)',
        'function transfer(address recipient, uint256 amount) public returns (bool)',
        'function approve(address spender, uint256 amount) public returns (bool)'
      ],
      alcxWhale
    )
    await alcx.transfer(alice.address, e18(100));
    await alcx.transfer(bob.address, e18(100));
    await alcx.transfer(charlie.address, e18(100));
    await alcx.transfer(salcx.address, e18(1));
    await salcx.connect(alice).initialize();

    expect(await salcx.balanceOf(alice.address)).to.equal(e18(1), "first sALCX");
    await expect(
      salcx.initialize()
    ).to.be.revertedWith("wrong amount or already initialized")

    await network.provider.request({
      method: "evm_increaseTime",
      params: [secondsDay],
    });

    await alcx.connect(bob).approve(salcx.address, e18(100))
    await salcx.connect(bob).deposit(e18(100))
    const bobsALCXBalance = await salcx.balanceOf(bob.address)
    console.log(bobsALCXBalance.toString())
    expect(bobsALCXBalance).to.be.lt(e18(100));
    expect(bobsALCXBalance.toString()).to.be.gt(e18(95));

    await network.provider.request({
      method: "evm_increaseTime",
      params: [secondsDay],
    });

    await alcx.connect(charlie).approve(salcx.address, e18(100))
    await salcx.connect(charlie).deposit(e18(100))
    const charliesALCXBalance = await salcx.balanceOf(charlie.address)
    console.log(charliesALCXBalance.toString())
    //expect(charliesALCXBalance.toString()).to.be.lt(bobsALCXBalance.toString());
    expect(charliesALCXBalance.toString()).to.be.gt(e18(95));

    await salcx.connect(bob).withdraw(bobsALCXBalance.toString())
    const bobAlcxBalance = await alcx.balanceOf(bob.address)
    expect(bobAlcxBalance.toString()).to.be.gt(e18(100))

    await salcx.connect(charlie).withdraw(charliesALCXBalance.toString())
    const charlieAlcxBalance = await alcx.balanceOf(charlie.address)
    expect(charlieAlcxBalance.toString()).to.be.gt(e18(100))
  });
});