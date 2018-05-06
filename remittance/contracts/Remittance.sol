pragma solidity ^0.4.21;

/*
The way I understand the description is the problem is:
-------------------------------------------------------
    1. Remittance contract (Alice) create the transfer.
    2. Exchange shop (Carol) will withdraw the transfer.
    3. Carol will recive the ETH, and based on how much she recived will pay
        flat currency to Bob. The fee's part for me happend off chain. (She decide
        to pay 90$ and keep 10$ as tax, when recive 100$(ETH) from transfer.)
        I didn't understand where to put the fee! Carol will recive ETH in simple
        wallet. What should be implement in the exchange contract isn't clear for me.
    4.The reciver (BOB) will recive flat currency based of what Carol wants to
    pay him after the fees.
*/

contract Remittance {
    address public owner;
    uint256 public constant MAXDURATION = 1000000; // in block numbers

    mapping(bytes32 => Transfer) private pendingTransfers;

    struct Transfer {
        uint256 amount;
        uint256 deadline; // in blocks?
    }

    event LogCreateTransfer(address transferCreator, address recipientAddr, uint256 deadline);
    event LogWithdrawTransfer(address recipient, uint256 withdrawValue, bytes32 passhash);
    event LogRefundTransfer(address creator, uint256 refundValue);
    event LogSelfDestruct(address sender, uint256 transferedBalance);


    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }


    function Remittance() public {
        owner = msg.sender;
    }


    function () public payable {}


    function createTransfer (
        address _transferRecipient,
        bytes32 _passHash,
        uint256 _duration
    ) public payable {
        require(_duration <= MAXDURATION);
        require(_duration > 0);
        require(msg.value > 0);
        require(msg.sender != _transferRecipient);
        require(_transferRecipient != address(0));

        bytes32 key = keccak256(msg.sender, _transferRecipient, _passHash);

        // to be sure the key isn't reused
        require(pendingTransfers[key].amount == 0);

        pendingTransfers[key] = Transfer({
            amount: msg.value,
            deadline: block.number + _duration
        });

        uint256 deadline = block.number + _duration;
        emit LogCreateTransfer(msg.sender, _transferRecipient, deadline);
    }


    function withdrawFunds(address _transferCreator, string _pass1, string _pass2) {
        bytes32 passHash = keccak256(_pass1, _pass2);
        bytes32 key = keccak256(_transferCreator, msg.sender, passHash);

        Transfer memory toWithdraw = pendingTransfers[key];

        require(toWithdraw.amount > 0);
        require(block.number <= toWithdraw.deadline);

        delete pendingTransfers[key];

        msg.sender.transfer(toWithdraw.amount);

        emit LogWithdrawTransfer(msg.sender, toWithdraw.amount , passHash);
    }


    function refundTransfer(address _transferRecipient, bytes32 passHash) {
        bytes32 key = keccak256(msg.sender, _transferRecipient, passHash);
        Transfer memory toRefund = pendingTransfers[key];
        require(toRefund.amount > 0);
        require(block.number > toRefund.deadline);

        msg.sender.transfer(toRefund.amount);

        emit LogRefundTransfer(msg.sender, toRefund.amount);

        delete pendingTransfers[key];
    }


    function killTheContract() onlyOwner public {
        emit LogSelfDestruct(msg.sender, address(this).balance);
        selfdestruct(owner);
    }

}
