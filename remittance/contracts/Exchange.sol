pragma solidity ^0.4.21;

import "./Remittance.sol";


contract Exchange {
    uint8 FEE = 10; // in %

    function getEth(string _pass1, string _pass2) {
        bool result = withdrawFunds(string _pass1, string _pass2);
    }
}
