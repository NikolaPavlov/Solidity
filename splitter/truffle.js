module.exports = {
  networks: {
    localhost: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    ropsten: {
      host: "localhost",
      port: 8545,
      network_id: "3",
      gas: 4700000
    }
  }
};
