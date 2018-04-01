pragma solidity ^0.4.0;

contract Splitter {
    address public owner;
    mapping (address => uint) public balances;


    event log_split(address depostitor, address out1, address out2, uint amount);

    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

    function () payable { }

    function Splitter () {
        owner == msg.sender;
    }

    function mockingSplit(address out1, address out2) payable returns (bool success) {
        // mocking of transfers in balances mapping
        require(msg.value > 0);
        require(out1 != 0);
        require(out2 != 0);
        require(msg.sender != out1);
        require(msg.sender != out2);
        require(out1 != out2);

        if (msg.value % 2 == 1) {
            balances[msg.sender] += 1;
        }

        balances[out1] += msg.value / 2;
        balances[out2] += msg.value / 2;

        log_split(msg.sender, out1, out2, msg.value);

        return true;
    }

    function realSplit(address out1, address out2) payable returns (bool success) {
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

    function checkBalanceOf(address addr) returns (uint) {
        return addr.balance;
    }

    function checkContractBalance() returns (uint) {
        return this.balance;
    }

    function killTheContract() onlyOwner {
        suicide(owner);
    }

    function forTesting() returns (string) {
        return 'gogo';
    }
}
