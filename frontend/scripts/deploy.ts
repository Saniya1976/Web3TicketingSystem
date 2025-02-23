import { ethers } from "hardhat";

async function main() {
  const TicketingSystem = await ethers.getContractFactory("TicketingSystem");
  const ticketingSystem = await TicketingSystem.deploy();
  await ticketingSystem.waitForDeployment();

  console.log("TicketingSystem deployed to:", await ticketingSystem.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });