/* Contracts in this test */

// const truffleAssert = require('truffle-assertions');

// const vals = require('../lib/testValuesCommon.js');

const TestERC20 = artifacts.require("../contracts/TestERC20.sol");
const Staking = artifacts.require("./Staking.sol");

const toBN = web3.utils.toBN;

contract("CanvasNFT", (accounts) => {
  const OVERFLOW_NUMBER = toBN(2, 10).pow(toBN(256, 10)).sub(toBN(1, 10));

  const owner = accounts[0];
  const account1 = accounts[1];

  let staking;
  let testERC20;

  before(async () => {
    staking = await Staking.deployed();
    testERC20 = await TestERC20.deployed();
    await testERC20.transfer(staking.address, toBN(100* (10 ** 18)));
  });

  // This is all we test for now

  // This also tests contractURI()

  describe('#constructor()', () => {
    it('deposit work', async () => {
      const addr = await staking.vntw();
      assert.equal(addr, testERC20.address);
      assert.equal(await testERC20.balanceOf(staking.address), Number(toBN(100 * (10 ** 18))));
      await testERC20.approve(staking.address, toBN(100 * (10 ** 18)));
      await staking.deposit(toBN(10 * (10 ** 18)), 30);
      await staking.deposit(toBN(10 * (10 ** 18)), 30);
      await staking.deposit(toBN(10 * (10 ** 18)), 90);
      assert.equal(await staking.depositNumber(), 3);
    });

    it('check reward', async () => {
        // Initiate 28 more transactions to make first deposit pass 30 blocks.
        for (let i = 0; i < 28; i ++) {
            await web3.eth.sendTransaction({from: owner, to: account1, value: 1});
        }
        
        //Reward is 3% = 0.3 token
        assert.equal(await staking.checkReward(0), Number(toBN(3 * (10 ** 17))));

        // Initiate 60 more transactions to make 1st deposit pass 90 blocks.
        for (let i = 0; i < 60; i ++) {
            await web3.eth.sendTransaction({from: owner, to: account1, value: 1});
        }

        //Reward of 1st deposit is 9% = 0.9 token
        assert.equal(await staking.checkReward(0), Number(toBN(9 * (10 ** 17))));

        //Initiate 1 more transaction to make 2nd deposit pass 90 blocks
        await web3.eth.sendTransaction({from: owner, to: account1, value: 1});

        //Reward of 2nd deposit is 9% = 0.9 token
        assert.equal(await staking.checkReward(1), Number(toBN(9 * (10 ** 17))));

        //Initiate 1 more transaction to make 3rd deposit pass 90 blocks
        await web3.eth.sendTransaction({from: owner, to: account1, value: 1});

        //Reward of 3rd deposit is 11% = 1.1 token
        assert.equal(await staking.checkReward(2), Number(toBN(11 * (10 ** 17))));

        // Initiate 45 more transactions to make 3rd deposit pass 135 blocks.
        for (let i = 0; i < 45; i ++) {
            await web3.eth.sendTransaction({from: owner, to: account1, value: 1});
        }

        //Reward of 3rd deposit is 11% * 1.5 = 1.1 * 1.5 token = 1.65 token
        assert.equal(await staking.checkReward(2), Number(toBN(165 * (10 ** 16))));
      });

      it('withdraw', async () => {
        // Initiate 43 more transactions to make 1rd deposit pass 180 blocks.
        for (let i = 0; i < 43; i ++) {
            await web3.eth.sendTransaction({from: owner, to: account1, value: 1});
        }

        //Reward of 1st deposit is 3% * 6 = 0.3 * 6 token = 1.8 token
        assert.equal(await staking.checkReward(0), Number(toBN(18 * (10 ** 17))));

        const balanceBefore = await testERC20.balanceOf(owner);
        console.log(balanceBefore);
        await staking.withdraw(0);
        assert.equal(await staking.depositNumber(), 2);
        const balanceAfter = await testERC20.balanceOf(owner);
        console.log(balanceAfter);
        console.log(Number(balanceAfter - balanceBefore));
      });
  });
});