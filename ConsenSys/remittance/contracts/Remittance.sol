pragma solidity ^0.4.0;


contract Remittance {
    address public owner;
    uint public FEE = 1;
    uint public DURATION = 1000;

    mapping(bytes32 => Transfer) private transfers;

    struct Transfer {
        address creator;
        address recipient;
        uint amount;
        uint deadline;
    }

    // logs
    event LogHashedPasses(bytes32 passhash);
    event LogCreateTransfer(address creator, address recipient, uint value, string pass1, string pass2);


    function Remittance() {
        owner = msg.sender;
    }

    function createTransfer(address transferRecipient, string pass1, string pass2) public payable returns (bool success) {
        require(msg.value > FEE);
        Transfer memory newTransfer;
        newTransfer.creator = msg.sender;
        newTransfer.recipient = transferRecipient;
        newTransfer.amount = msg.value - FEE;
        newTransfer.deadline = block.number + DURATION;
        transfers[keccak256(pass1, pass2)] = newTransfer;
        LogCreateTransfer(newTransfer.creator, newTransfer.recipient, newTransfer.amount, pass1, pass2);
        LogHashedPasses(keccak256(pass1, pass2));

        return true;
    }

    function withdrawFunds(string pass1, string pass2) public returns (bool success) {
        bytes32 passhash = keccak256(pass1, pass2);
        Transfer memory toWithdraw = transfers[passhash];
        require(toWithdraw.amount > 0);
        require(msg.sender == toWithdraw.recipient);
        require(block.number <= toWithdraw.deadline);
        delete transfers[passhash];
        toWithdraw.recipient.transfer(toWithdraw.amount);
        return true;
    }
}

// 0xa22d305debca5e692732aad3a70e5aeea526c9c439c2536f615ad7e9baee23fc
// 0xa22d305debca5e692732aad3a70e5aeea526c9c439c2536f615ad7e9baee23fc
