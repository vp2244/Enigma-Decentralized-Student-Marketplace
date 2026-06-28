// Network config. GitHub Actions can replace the Sepolia placeholders during deployment.
// Local development falls back to the hardcoded values below.
export const NETWORKS = {
  anvil: {
    label: "Local Anvil (dev)", chainId: 31337, rpcUrl: "http://127.0.0.1:8545", explorer: "",
    addresses: { EnigCredit: "0x5fbdb2315678afecb367f032d93f642f64180aa3", Marketplace: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512", Reputation: "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0" },
  },
  sepolia: {
    label: "Sepolia (hosted demo)", chainId: 11155111, rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com", explorer: "https://sepolia.etherscan.io",
    addresses: {
      EnigCredit: "0xd0f5a24EA9638645daD0cFd03AE6daa3041c23cd",
      Marketplace: "0x9cc006e9dFe3E9A1726eFc9bC4FefEA88a99f60A",
      Reputation: "0x18C5819ccdc4D26c1c69DDb84f71dB6faC355e72",
    },
  },
};
export const DEFAULT_NETWORK = "anvil";
