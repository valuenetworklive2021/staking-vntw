pragma solidity 0.5.16;

import "./interfaces/IBEP20.sol";
import "./libraries/Context.sol";
import "./libraries/SafeMath.sol";
import "./libraries/Ownable.sol";

contract Staking is Context, Ownable {
    using SafeMath for uint256;

    address public vntw;
    // uint256 public SECONDS_IN_A_DAY = 28800;
    uint256 public SECONDS_IN_A_DAY = 1;

    struct DepositInfo {
        uint256 amount;
        uint256 time;
        uint256 period;
    }

    mapping (address => DepositInfo[]) public userInfo;
    event DepositLP(address indexed sender, uint amount, uint depositType);
    event WithdrawLP(address indexed farmingPool, uint amount);

    constructor(
        address _vntw
    ) public {
        require(_vntw != address(0), 'Invalid swap router address');
        vntw = _vntw;
    }

    function deposit(uint256 amount, uint256 period) external {
        require(period == 30 || period == 90, 'Staking: Invalid deposit type');        
        IBEP20(vntw).transferFrom(msg.sender, address(this), amount);
        DepositInfo memory depositInfo;
        depositInfo.amount = amount;
        depositInfo.time = block.number;        
        depositInfo.period = period;
        userInfo[msg.sender].push(depositInfo);
     
        emit DepositLP(msg.sender, amount, period);
    }

    function checkReward(uint256 id) public view returns (uint256) {
        require(id < userInfo[msg.sender].length, 'Staking: Invalid Id');
        DepositInfo storage depositInfo = userInfo[msg.sender][id];
        uint256 periodInBlock = depositInfo.period * SECONDS_IN_A_DAY;
        require( depositInfo.time + periodInBlock <= block.number, 'Staking: Period is not over');
        uint256 reward;
        if (depositInfo.period == 30) {
            reward = depositInfo.amount * (block.number - depositInfo.time) * 3 / (periodInBlock * 100);
        }
        else if (depositInfo.period == 90) {
            reward = depositInfo.amount * (block.number - depositInfo.time) * 11 / (periodInBlock * 100);
        }
        return reward;
    }

    function depositNumber() public view returns (uint256) {
        uint256 number;
        number = userInfo[msg.sender].length;
        return number;
    }

    function withdraw(uint256 id) external {
        uint256 reward = checkReward(id);
        IBEP20(vntw).transfer(msg.sender, userInfo[msg.sender][id].amount + reward);
        userInfo[msg.sender][id] = userInfo[msg.sender][userInfo[msg.sender].length-1];
        delete userInfo[msg.sender][userInfo[msg.sender].length-1];
        userInfo[msg.sender].length--;
    }


    function withdrawToken(uint amount) external onlyOwner {
        IBEP20(vntw).transfer(msg.sender, amount);
    }

    function setVNTW(address _vntw) external onlyOwner {
        vntw = _vntw;
    }
}
