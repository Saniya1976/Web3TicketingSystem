import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";

export const CONTRACT_ABI = [
  "function createTicket(string, uint256) returns (uint256)",
  "function buyTicket(uint256) payable",
  "function sellTicket(uint256, uint256)",
  "function transferTicket(uint256, address)",
  "function getTicket(uint256) view returns (tuple(uint256 id, string eventName, uint256 price, address owner, bool isValid, bool isForSale))"
];

export async function getContract(signer?: ethers.Signer) {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Please install MetaMask");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer || provider
  );
}