pragma solidity ^0.4.21;


import "./MintableToken.sol";


contract LimeCoin is MintableToken {
    string public name = "LimeCoin";
    string public symbol = "LET";
    uint8 public decimals = 18;
}
