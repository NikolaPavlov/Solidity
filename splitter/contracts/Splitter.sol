pragma solidity ^0.4.21;


contract Splitter {
    address public owner;

    event Split(address depostitor, address out1, address out2, uint amount);
    event LogSelfDestruct(address sender, uint amount);


    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }


    modifier checkForSameAddr(address _addr1, address _addr2, address _addr3) {
        require(_addr1 != _addr2 &&
                _addr1 != _addr3 &&
                _addr2 != _addr3);
        _;
    }


    modifier validAddress(address _addr) {
        require(_addr != address(0));
        _;
    }


    function Splitter () public {
        owner = msg.sender;
    }


    function () public payable { }


    function split(address _recivingAddr1, address _recivingAddr2)
    validAddress(_recivingAddr1)
    validAddress(_recivingAddr2)
    checkForSameAddr(msg.sender, _recivingAddr1, _recivingAddr2)
    public payable returns (bool success) {

        require(msg.value > 1);

        if (msg.value % 2 == 1) {
            _recivingAddr1.transfer(msg.value / 2 + 1);
            _recivingAddr2.transfer(msg.value / 2);
        } else {
            _recivingAddr1.transfer(msg.value / 2);
            _recivingAddr2.transfer(msg.value / 2);
        }

        emit Split(msg.sender, _recivingAddr1, _recivingAddr2, msg.value);

        return true;
    }

    function checkBalanceOf(address _addr) public view returns (uint) {
        return _addr.balance;
    }

    function checkContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    function killTheContract() onlyOwner public {
        emit LogSelfDestruct(msg.sender, address(this).balance);
        selfdestruct(owner);
    }
}
