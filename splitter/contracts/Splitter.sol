pragma solidity ^0.4.0;

contract Splitter {
    address public owner;
    mapping (address => uint) public balances;


    event log_split(address depostitor, address out1, address out2, uint amount);

    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

    function Splitter () {
        owner == msg.sender;
    }

    function split(address out1, address out2) payable returns (bool success) {
        require(msg.value > 0);
        require(out1 != 0);
        require(out2 != 0);

        if (msg.value % 2 == 1) {
            balances[msg.sender] += 1;
        }

        balances[out1] += msg.value / 2;
        balances[out2] += msg.value / 2;

        log_split(msg.sender, out1, out2, msg.value);

        return true;
    }

    function checkBalance(address adrr) returns (uint) {
        return address(adrr).balance;
    }

    function killTheContract() onlyOwner {
        suicide(owner);
        return true;
    }
}
