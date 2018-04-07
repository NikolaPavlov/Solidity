
# The ICO preparation task
The purpose of this task is to be preparation for ICO smart contracts.

## What is an ICO?
ICO = Initial Coin Offering

This is a popular mechanism for new companies to raise capital without requiring angel investment or VC investment, but instead relying on the crowd for financing the company.

The purpose of an ICO is to raise funds through selling custom tokens. These tokens can represent many forms of business value (shares of the company, % of the profit, etc). The meaning of the token bears no significance to the technical implementation.

An ICO consists of two smart contracts:
- The ERC20 token - Smart contract obliging to the ERC20 standard. Basically this is a smart contract holding balances of different user of your new token. It defines the rules for transfering and the charcteristics of the token (how many decimal places does it have, what is the name of the token, etc.)
- The Crowdsale smart contract - this smart contract defines the process of the crowdsale itself. It encapsulates the logic for receiving ether and creating (called minting) of new tokens based on a given condition (normally a multiplication rate).

Normally an ICO crowdsale has different bonus stages. These bonus stages can be limited by time or by maximum ether raised. During these bonus stages the investors are offered a better rate.

*Example 1:*
From 01.01.2018 to 10.01.2018 the rate is 2000 Tokens per 1 ETH
From 11.01.2018 to 20.01.2018 the rate is 1500 Tokens per ETH
From 21.01.2018 until the end of the ICO the rate is 1000 Tokens per ETH

*Example 2:*
For the first 100 ETH of the crowdsale the rate is 2000 Tokens per 1 ETH
For the next 200 ETH of the crowdsale the rate is 1500 Tokens per 1 ETH
The rest of the campaign has a rate of 1000 Tokens per 1 ETH

**Important:** There is also the posibility to combine Examples 1 and 2.

## The task
### Requirements Level 1
Create an ICO Crowdsale smart contracts system. The abbreviation of the token should be LET, the name of the token should be LimeChain Exam Token and should have 18 decimal points.

The Crowdsale should be 30 days long (from an date of your choice). The default rate of exchange of tokens should be **1ETH = 100 LET**.

### Requirements Level 2

During the first 7 days the rate should be **1ETH = 500 LET**. If during these 7 days 10 ETH are raised the rate should go down to **1ETH = 300 LET**.

During the second 7 days (7 to 15) the rate should be **1ETH = 200 LET** and if the total ETH raised from the begining of the campaign reaches 30ETH the rate should go down to **1ETH = 150 ETH**.

For the remainder of the Period the rate should be the default one.

### Requirements Level 3
The transfering (trading) of tokens should be disabled until the Crowdsale is over.

### Requirements Level 4
Create a way for the Crowdsale Admin to mint free tokens during the crowdsale. This is sometimes needed as rewards for people doing marketing for the ICO.

## Resources and where to start from

[https://github.com/OpenZeppelin/zeppelin-solidity/tree/master/contracts](https://github.com/OpenZeppelin/zeppelin-solidity/tree/master/contracts)
