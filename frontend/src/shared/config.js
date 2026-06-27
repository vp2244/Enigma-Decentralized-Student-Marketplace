// Network config. Paste deployed addresses per network after `forge script Deploy`.
export const NETWORKS = {
  anvil: {
    label: "Local Anvil (dev)", chainId: 31337, rpcUrl: "http://127.0.0.1:8545", explorer: "",
    addresses: { EnigCredit: "0x5fbdb2315678afecb367f032d93f642f64180aa3", Marketplace: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512", Reputation: "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0" },
  },
  sepolia: {
    label: "Sepolia (hosted demo)", chainId: 11155111, rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com", explorer: "https://sepolia.etherscan.io",
    addresses: { EnigCredit: "0x31627B4593B3384BD835889F1Df5473ebcbF0de5", Marketplace: "0xA18A3852df23d161EfD8D7772CBdE9FA254905cb", Reputation: "0x64c9edB8e9f5d26508E750dd921E3C680e007A6C" },
  },
};
export const DEFAULT_NETWORK = "anvil";
