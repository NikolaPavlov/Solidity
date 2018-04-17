## Address Ropsten Network:
Remittance: 0x22143681ccde8ab15fca7d0a645e8729a2f31cb6


REMITTANCE
------------
You will create a smart contract named Remittance whereby:

  * There are three people: Alice, Bob & Carol.
  * Alice wants to send funds to Bob, but she only has ether & Bob wants to be paid in local currency.
  * Luckily, Carol runs an exchange shop that converts ether to local currency.

Therefore, to get the funds to Bob, Alice will allow the funds to be transferred through Carol's Exchange Shop. Carol will convert the ether from Alice into local currency for Bob (possibly minus commission).

To successfully withdraw the ether from Alice, Carol needs to submit two passwords to Alice's Remittance contract: one password that Alice gave to Carol in an email and another password that Alice sent to Bob over SMS. Since they each have only half of the puzzle, Bob & Carol need to meet in person so they can supply both passwords to the contract. This is a security measure. It may help to understand this use-case as similar to a 2-factor authentication.

Once Carol & Bob meet and Bob gives Carol his password from Alice, Carol can submit both passwords to Alice's remittance contract. If the passwords are correct, the contract will release the ether to Carol who will then convert it into local funds and give those to Bob (again, possibly minus commission).

Of course, for safety, no one should send their passwords to the blockchain in the clear.

Stretch goals:

  * [x] add a deadline, after which Alice can claim back the unchallenged Ether
  * [x] add a limit to how far in the future the deadline can be
  * [x] add a kill switch to the whole contract
  * [?]plug a security hole (which one?) by changing one password to the recipient's address
  * [x] make the contract a utility that can be used by David, Emma and anybody with an address
  * [?]make you, the owner of the contract, take a cut of the Ethers smaller than what it would cost Alice to deploy the same contract herself


  Remittance Behavior:
  ----------------------
* Constructor accept duration of the created transfers in blocks, if value isn't pass it's use MAXDURATION 1000000 blocks for deadline.
* Anyone can create transfer with attached ethers for someone else to withdraw (recipient address and two passwords need to be provided) 
* When transfer is created, the recipient can withdraw it if he knows both passwords and the duration isn't expired.
* After deadline the creator of the transfer can revert it to himself.
* If contract is killed all eth in it return to the owner.
