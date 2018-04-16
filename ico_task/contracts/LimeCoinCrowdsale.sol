pragma solidity 0.4.21;


import "./MintedCrowdsale.sol";
import "./TimedCrowdsale.sol";
import "./PostDeliveryCrowdsale.sol";
import "./SafeMath.sol";
import "./MintableToken.sol";
import "./Ownable.sol";

import "./LimeCoin.sol";


contract LimeCoinCrowdsale is TimedCrowdsale, MintedCrowdsale, PostDeliveryCrowdsale {
    // 30 days long crowdsale.
    // 1st 7days 1ETH = 500LET (if raised money > 10ETH ---> 1ETH = 300LET)
    // 2nd 7days 1ETH = 200LET (if raised money > 30ETH ---> 1ETH = 150LET)
    // last 16days 1ETH = 100LET

    MintableToken theToken;
    uint256 private sevenDays = 86400 * 7;
    uint256 private fourteenDays = 86400 * 14;

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

    // debug function
    function getCurrentTimeblock() public view returns (uint256) {
        return block.timestamp;
    }

    // return current rate accordint to preIco and prepreICO requirements
    function getCurrentRate() public view returns (uint256) {
        if (!isStarted()) {
            return 0;
        }

        // last 16days 1ETH=100LET;
        if (block.timestamp > openingTime + fourteenDays) {
            return rate; // start rate
        }

        if (block.timestamp > openingTime + sevenDays) {
            // 2nd 7days if weiRaised > 30ETH ---> 1ETH=150LET
            if (weiRaised > 30 ether) {
                return (rate.mul(3).div(2)); // x1.5
            }
            // 2nd 7days if weiRaised < 30ETH ---> 1ETH=200LET
            return rate.mul(2);
        }

        // 1st 7days if weiRaised > 10ETH ---> 1ETH=300LET
        if (weiRaised > 10 ether) {
            return rate.mul(3);
        }
        // 1st 7days 1ETH=500LET if weiRaised < 10ETH ---> 1ETH=500LET
        return rate.mul(5);
    }

    // override for impiment the preIco and prepreICO rates
    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
        uint256 currentRate = getCurrentRate();
        return currentRate.mul(_weiAmount);
    }

    // mint tokens from Crowdsale contract
    function mintTokensFor(address _beneficiary, uint256 _tokenAmount) public {
        theToken.mint(_beneficiary, _tokenAmount);
    }

}
