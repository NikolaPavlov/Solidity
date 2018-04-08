pragma solidity ^0.4.18;


import "../token/ERC20/StandardToken.sol";


contract SimpleToken is StandardToken {
    string public constant name = "LimeChain Exam Token";
    string public constant symbol = "LET";
    uint8 public constant decimals = 18;

    uint256 public constant INITIAL_SUPPLY = 10000 * (10 ** uint256(decimals));


    function SimpleToken() public {
        totalSupply_ = INITIAL_SUPPLY;
        balance[msg.sender] = INITIAL_SUPPLY;
        Transfer(0x0, msg.sender, INITIAL_SUPPLY);
    }
}
