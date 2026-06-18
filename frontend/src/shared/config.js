// Network config. Paste deployed addresses per network after `forge script Deploy`.
export const NETWORKS = {
  anvil: {
    label: "Local Anvil (dev)", chainId: 31337, rpcUrl: "http://127.0.0.1:8545", explorer: "",
    addresses: { EnigCredit: "0x0000000000000000000000000000000000000000", Marketplace: "0x0000000000000000000000000000000000000000" },
  },
  sepolia: {
    label: "Sepolia (hosted demo)", chainId: 11155111, rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com", explorer: "https://sepolia.etherscan.io",
    addresses: { EnigCredit: "0x0000000000000000000000000000000000000000", Marketplace: "0x0000000000000000000000000000000000000000" },
  },
};
export const DEFAULT_NETWORK = "anvil";
