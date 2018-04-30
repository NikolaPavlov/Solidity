pragma solidity ^0.4.21;


import "../node_modules/zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/distribution/PostDeliveryCrowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

import "./LimeCoin.sol";


contract LimeCoinCrowdsale is TimedCrowdsale, MintedCrowdsale, PostDeliveryCrowdsale {

    MintableToken theToken;

    function LimeCoinCrowdsale(
        uint256 _openingTime,
        uint256 _closingTime,
        uint256 _rate,
        address _wallet,
        MintableToken _token
        )
        public payable
        TimedCrowdsale(_openingTime, _closingTime)
        Crowdsale(_rate, _wallet, _token)
        PostDeliveryCrowdsale()
        MintedCrowdsale() {
            theToken = MintableToken(_token);
        }


    function isStarted() public view returns (bool open) {
        return block.timestamp > openingTime;
    }


    function getCurrentRate() public view returns (uint256) {
        if (!isStarted()) {
            return 0;
        }

        if (block.timestamp > openingTime + 14 days) {
            return rate;
        }

        if (block.timestamp > openingTime + 7 days) {
            if (weiRaised > 30 ether) {
                return (rate.mul(3).div(2)); // x1.5
            }
            return rate.mul(2);
        }

        if (weiRaised > 10 ether) {
            return rate.mul(3);
        }
        return rate.mul(5);
    }


    // override parent for impiment the preIco and prepreICO rates
    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
        uint256 currentRate = getCurrentRate();
        return currentRate.mul(_weiAmount);
    }


    function mintTokensFor(address _beneficiary, uint256 _tokenAmount) public {
        theToken.mint(_beneficiary, _tokenAmount);
    }

}
