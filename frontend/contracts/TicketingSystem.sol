// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TicketingSystem {
    struct Ticket {
        uint256 id;
        string eventName;
        uint256 price;
        address owner;
        bool isValid;
        bool isForSale;
    }

    mapping(uint256 => Ticket) public tickets;
    uint256 private _ticketIds;

    event TicketCreated(uint256 indexed ticketId, string eventName, uint256 price, address owner);
    event TicketBought(uint256 indexed ticketId, address indexed previousOwner, address indexed newOwner);
    event TicketSold(uint256 indexed ticketId, address indexed seller, uint256 price);
    event TicketTransferred(uint256 indexed ticketId, address indexed from, address indexed to);

    function createTicket(string memory eventName, uint256 price) public returns (uint256) {
        _ticketIds++;
        tickets[_ticketIds] = Ticket({
            id: _ticketIds,
            eventName: eventName,
            price: price,
            owner: msg.sender,
            isValid: true,
            isForSale: false
        });

        emit TicketCreated(_ticketIds, eventName, price, msg.sender);
        return _ticketIds;
    }

    function buyTicket(uint256 ticketId) public payable {
        require(tickets[ticketId].isValid, "Ticket does not exist");
        require(tickets[ticketId].isForSale, "Ticket is not for sale");
        require(msg.value >= tickets[ticketId].price, "Insufficient payment");

        address previousOwner = tickets[ticketId].owner;
        tickets[ticketId].owner = msg.sender;
        tickets[ticketId].isForSale = false;

        payable(previousOwner).transfer(msg.value);

        emit TicketBought(ticketId, previousOwner, msg.sender);
    }

    function sellTicket(uint256 ticketId, uint256 price) public {
        require(tickets[ticketId].isValid, "Ticket does not exist");
        require(tickets[ticketId].owner == msg.sender, "Not ticket owner");

        tickets[ticketId].isForSale = true;
        tickets[ticketId].price = price;

        emit TicketSold(ticketId, msg.sender, price);
    }

    function transferTicket(uint256 ticketId, address to) public {
        require(tickets[ticketId].isValid, "Ticket does not exist");
        require(tickets[ticketId].owner == msg.sender, "Not ticket owner");
        require(to != address(0), "Invalid recipient address");

        tickets[ticketId].owner = to;
        tickets[ticketId].isForSale = false;

        emit TicketTransferred(ticketId, msg.sender, to);
    }

    function getTicket(uint256 ticketId) public view returns (Ticket memory) {
        require(tickets[ticketId].isValid, "Ticket does not exist");
        return tickets[ticketId];
    }
}