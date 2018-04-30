pragma solidity ^0.4.21;


import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";


contract LimeCoin is MintableToken {
    string public name = "LimeCoin";
    string public symbol = "LET";
    uint8 public decimals = 18;
}
