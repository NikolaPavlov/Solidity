pragma solidity ^0.4.0;


contract Remittance {
    address public owner;
    uint public FEE = 1;
    uint public DURATION = 1000;

    mapping(bytes32 => Transfer) private pending_transfers;

    struct Transfer {
        address creator;
        address recipient;
        uint amount;
        uint deadline;
    }

    event LogCreateTransfer(address creator, address recipient, uint value, bytes32 passhash);
    event LogWithdrawTransfer(address recipient, uint value, bytes32 passhash);


    function Remittance() {
        owner = msg.sender;
    }

    function createTransfer(address transferRecipient, string pass1, string pass2) public payable returns (bool success) {
        require(msg.value > FEE);
        require(transferRecipient != msg.sender);

        Transfer memory newTransfer;
        newTransfer.creator = msg.sender;
        newTransfer.recipient = transferRecipient;
        newTransfer.amount = msg.value - FEE;
        newTransfer.deadline = block.number + DURATION;
        bytes32 passhash = keccak256(pass1, pass2);
        pending_transfers[passhash] = newTransfer;

        LogCreateTransfer(newTransfer.creator, newTransfer.recipient, newTransfer.amount, passhash);

        return true;
    }

    function withdrawFunds(string pass1, string pass2) public returns (bool success) {
        bytes32 passhash = keccak256(pass1, pass2);

        Transfer memory toWithdraw = pending_transfers[passhash];

        require(toWithdraw.amount > 0);
        require(msg.sender == toWithdraw.recipient);
        require(block.number <= toWithdraw.deadline);

        delete pending_transfers[passhash];

        toWithdraw.recipient.transfer(toWithdraw.amount);

        LogWithdrawTransfer(msg.sender, toWithdraw.amount, passhash);

        return true;
    }
}

// 0xa22d305debca5e692732aad3a70e5aeea526c9c439c2536f615ad7e9baee23fc
// 0xa22d305debca5e692732aad3a70e5aeea526c9c439c2536f615ad7e9baee23fc
