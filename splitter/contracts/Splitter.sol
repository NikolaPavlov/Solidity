pragma solidity ^0.4.0;

contract Splitter {
    address public owner;
    // mapping (address => uint) public balances;

    event log_split(address depostitor, address out1, address out2, uint amount);

    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

    function Splitter () public {
        owner == msg.sender;
    }

    function () payable { }

    function split(address out1, address out2) public payable returns (bool success) {
        // real transfers on the network
        require(msg.value > 0);
        require(out1 != 0);
        require(out2 != 0);
        require(msg.sender != out1);
        require(msg.sender != out2);
        require(out1 != out2);

        if (msg.value % 2 == 1) {
            msg.sender.transfer(1);
        }

        out1.transfer(msg.value / 2);
        out2.transfer(msg.value / 2);

        log_split(msg.sender, out1, out2, msg.value);

        return true;
    }

    function checkBalanceOf(address addr) public returns (uint) {
        return addr.balance;
    }

    function checkContractBalance() public returns (uint) {
        return this.balance;
    }

    function killTheContract() onlyOwner public {
        // suicide(owner);
        selfdestruct(owner);
    }
}
