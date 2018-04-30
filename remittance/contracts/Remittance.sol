pragma solidity ^0.4.21;


contract Remittance {
    address public owner;
    uint256 public constant FEE = 100; // wei
    uint256 public constant MAXDURATION = 1000000; // in block numbers

    mapping(bytes32 => Transfer) public pendingTransfers;

    struct Transfer {
        address creator; //
        address recipient; //
        uint256 amount;
        uint256 deadline; // in blocks?
    }

    event LogCreateTransfer(address creator, address recipient, uint256 value, bytes32 passhash);
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
        string _pass1hash,
        string _pass2hash,
        uint256 _duration
    ) public payable returns (bool success) {
        require(msg.value > FEE);
        require(_transferRecipient != msg.sender);
        require(_duration <= MAXDURATION);
        require(_duration != 0);
        bytes32 passhash = keccak256(_pass1hash, _pass2hash, _transferRecipient);
        require(pendingTransfers[passhash].creator == 0);

        Transfer memory newTransfer;
        newTransfer.creator = msg.sender;
        newTransfer.recipient = _transferRecipient;
        newTransfer.amount = msg.value;
        newTransfer.deadline = block.number + _duration;
        pendingTransfers[passhash] = newTransfer;

        emit LogCreateTransfer(newTransfer.creator, newTransfer.recipient, newTransfer.amount, passhash);
        return true;
    }

    // TODO: Need to figure out where to put the FEE! The task description isn't clear.
    function withdrawFunds(string _pass1, string _pass2) public returns (bool success) {
        // msg.sender can withdraw the funds if:
        //   - msg.sender == receiver
        //   - has _pass1+_pass2
        //   - deadline isn't expired
        bytes32 passhash = keccak256(_pass1, _pass2, msg.sender);

        Transfer memory toWithdraw = pendingTransfers[passhash];

        require(toWithdraw.amount > 0);
        require(msg.sender == toWithdraw.recipient);
        require(block.number <= toWithdraw.deadline);

        delete pendingTransfers[passhash];

        // 2300 gas
        // x.transfer(y) will revert if the send fails
        toWithdraw.recipient.transfer(toWithdraw.amount - FEE);
        toWithdraw.creator.transfer(FEE);

        emit LogWithdrawTransfer(msg.sender, toWithdraw.amount - FEE , passhash);

        return true;
    }

    function refundTransfer(string _pass1, string _pass2, address _transferRecipient) public returns (bool success) {
        // You can revert the transfer if:
        // - has the _pass1 and _pass2
        // - you are the creator (msg.sender = creator of the transfer)
        // - the deadline is expired and the transfer isn't withdraw already
        bytes32 passhash = keccak256(_pass1, _pass2, _transferRecipient);
        Transfer memory toRefund = pendingTransfers[passhash];
        require(msg.sender == toRefund.creator);
        require(block.number > toRefund.deadline);

        msg.sender.transfer(toRefund.amount);

        emit LogRefundTransfer(toRefund.creator, toRefund.amount);

        delete pendingTransfers[passhash];

        return true;
    }

    function checkBalanceOf(address addr) public view returns (uint256) {
        return addr.balance;
    }

    function checkContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function killTheContract() onlyOwner public {
        emit LogSelfDestruct(msg.sender, address(this).balance);
        selfdestruct(owner);
    }

}
