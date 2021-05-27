const TestERC20 = artifacts.require("../contracts/TestERC20.sol");
const Staking = artifacts.require("./Staking.sol");

const toBN = web3.utils.toBN;

module.exports = async function (deployer) {
  await deployer.deploy(TestERC20,  {gas: 9000000});
  await deployer.deploy(Staking, TestERC20.address, {gas: 5000000});  
};
