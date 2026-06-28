// Network config. GitHub Actions can replace the Sepolia placeholders during deployment.
// Local development falls back to the hardcoded values below.
export const NETWORKS = {
  anvil: {
    label: "Local Anvil (dev)", chainId: 31337, rpcUrl: "http://127.0.0.1:8545", explorer: "",
    addresses: { EnigCredit: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", Marketplace: "0x5FbDB2315678afecb367f032d93F642f64180aa3", Reputation: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" },
  },
  sepolia: {
    label: "Sepolia (hosted demo)", chainId: 11155111, rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com", explorer: "https://sepolia.etherscan.io",
    addresses: {
      EnigCredit: "0x73e02654053421797Fa0914ABE4115acC5A84c04",
      Marketplace: "0xE9d0b3F767c636F38C0a4cAcEDaed1845a088977",
      Reputation: "0x2211f4ADCd951E26ed613Ec648af3d318EeA87ba",
    },
  },
};
export const DEFAULT_NETWORK = "anvil";
