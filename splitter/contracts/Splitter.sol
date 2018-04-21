pragma solidity ^0.4.21;

contract Splitter {
    address public owner;

    event LogSplit(address depostitor, address out1, address out2, uint amount);
    event LogSelfDestruct(address sender, uint amount);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function Splitter () public {
        owner = msg.sender;
    }

    function () public payable { }

    function split(address out1, address out2) public payable returns (bool success) {
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

        emit LogSplit(msg.sender, out1, out2, msg.value);

        return true;
    }

    function checkBalanceOf(address addr) public view returns (uint) {
        return addr.balance;
    }

    function checkContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    function killTheContract() onlyOwner public {
        emit LogSelfDestruct(msg.sender, address(this).balance);
        selfdestruct(owner);
    }
}
