pragma solidity ^0.4.0;


contract Remittance {
    address public owner;
    uint public FEE = 1; // wei
    uint public DURATION = 1000; // in block numbers

    mapping(bytes32 => Transfer) private pendingTransfers;

    struct Transfer {
        address creator;
        address recipient;
        uint amount;
        uint deadline;
    }

    event LogCreateTransfer(address creator, address recipient, uint value, bytes32 passhash);
    event LogWithdrawTransfer(address recipient, uint withdraw_value, bytes32 passhash);
    event LogRefundTransfer(address creator, uint refundValue);
    event LogSelfDestruct(address sender, uint balance);
    // TODO: event LogDespositReceived

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function Remittance() {
        owner = msg.sender;
    }

    function () payable {}

    // TODO: Need to figure out where to put the FEE!
    function createTransfer(address transferRecipient, string pass1, string pass2) public payable returns (bool success) {
        // Create transfer in pendingTransfers.
        // record receipient address (msg.sender != receipient)
        // record hash from pass1 + pass2
        // record the duration (if duration isn't expired, the transfer can be withdraw from receipient)
        require(msg.value > FEE);
        require(transferRecipient != msg.sender);
        bytes32 passhash = keccak256(pass1, pass2);
        // require(pendingTransfers[passhash] == 0);

        // check if the transfer with passhash key exist
        if (pendingTransfers[passhash].creator == 0) {
            Transfer memory newTransfer;
            newTransfer.creator = msg.sender;
            newTransfer.recipient = transferRecipient;
            newTransfer.amount = msg.value;
            newTransfer.deadline = block.number + DURATION;
            pendingTransfers[passhash] = newTransfer;

            LogCreateTransfer(newTransfer.creator, newTransfer.recipient, newTransfer.amount, passhash);
            return true;
        }
        return false;
    }

    function withdrawFunds(string pass1, string pass2) public returns (bool success) {
        // msg.sender can withdraw the funds if:
        //   - msg.sender == receiver
        //   - has pass1+pass2
        //   - deadline isn't expired
        bytes32 passhash = keccak256(pass1, pass2);

        Transfer memory toWithdraw = pendingTransfers[passhash];

        require(toWithdraw.amount > 0);
        require(msg.sender == toWithdraw.recipient);
        require(block.number <= toWithdraw.deadline);

        delete pendingTransfers[passhash];

        // 2300 gas
        // x.transfer(y) will revert if the send fails
        toWithdraw.recipient.transfer(toWithdraw.amount - FEE);
        toWithdraw.creator.transfer(FEE);

        LogWithdrawTransfer(msg.sender, toWithdraw.amount - FEE , passhash);

        return true;
    }

    function refundTransfer(string pass1, string pass2) public returns (bool success) {
        // You can revert the transfer if:
        // - has the pass1 and pass2
        // - you are the creator (msg.sender = creator of the transfer)
        // - the deadline is expired and the transfer isn't withdraw already
        bytes32 passhash = keccak256(pass1, pass2);

        Transfer toRefund = pendingTransfers[passhash];

        require(msg.sender == toRefund.creator);
        require(block.number > toRefund.deadline);

        delete pendingTransfers[passhash];
        msg.sender.transfer(toRefund.amount);

        LogRefundTransfer(toRefund.creator, toRefund.amount);

        return true;
    }

    function checkBalanceOf(address addr) returns (uint) {
        return addr.balance;
    }

    function checkContractBalance() returns (uint) {
        return this.balance;
    }

    function killTheContract() onlyOwner public {
        LogSelfDestruct(msg.sender, this.balance);
        selfdestruct(owner);
    }

    //TODO: best practices
    // add pause the contract
    // add update(upgrade) mechanism
}
