// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EventTickets is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct TicketMetadata {
        string eventName;
        string venue;
        string section; 
        string seat;
        string imageURI;
        string additionalDetails;
    }

    struct Ticket {
        uint256 eventId;
        uint256 originalPrice;
        uint256 currentPrice;
        uint256 maxResalePrice;
        uint256 eventDate;
        bool isValid;
        string metadataCID;
        TicketMetadata metadata;
    }

    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => bool) public usedTickets;
    mapping(address => bool) public organizers;
    mapping(uint256 => address[]) public ownershipHistory;
    mapping(uint256 => mapping(address => uint256)) public fractionalOwnership;
    
    uint256 public royaltyPercent = 10;
    uint256 public constant PRICE_CEILING_MULTIPLIER = 150; // 150% of original price

    event TicketMinted(uint256 tokenId, uint256 eventId, address to);
    event TicketResold(uint256 tokenId, uint256 newPrice);
    event TicketTransferred(uint256 tokenId, address from, address to);
    event TicketUsed(uint256 tokenId, address user);
    event OrganizerUpdated(address organizer, bool status);
    event FractionalOwnershipUpdated(uint256 tokenId, address owner, uint256 share);

    modifier onlyOrganizer() {
        require(organizers[_msgSender()], "Not organizer");
        _;
    }

    constructor() ERC721("EventTicket", "ETKT") {
        organizers[msg.sender] = true;
    }

    function updateOrganizer(address organizer, bool status) external onlyOwner {
        require(organizer != address(0), "Invalid address");
        if (status) require(!organizers[organizer], "Already organizer");
        else require(organizer != msg.sender, "Cannot remove self");
        
        organizers[organizer] = status;
        emit OrganizerUpdated(organizer, status);
    }

    function mintTicket(
        address to,
        uint256 eventId,
        uint256 price,
        uint256 eventUnixTime,
        string memory metadataCID,
        TicketMetadata memory metadata
    ) public onlyOrganizer {
        require(to != address(0), "Invalid address");
        require(price > 0, "Price must be > 0");
        require(eventUnixTime > block.timestamp, "Event must be future");

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        
        _safeMint(to, tokenId);
        
        tickets[tokenId] = Ticket({
            eventId: eventId,
            originalPrice: price,
            currentPrice: price,
            maxResalePrice: (price * PRICE_CEILING_MULTIPLIER) / 100,
            eventDate: eventUnixTime,
            isValid: true,
            metadataCID: metadataCID,
            metadata: metadata
        });
        
        ownershipHistory[tokenId].push(to);
        emit TicketMinted(tokenId, eventId, to);
    }

    function batchMintTickets(
        address[] calldata recipients,
        uint256 eventId,
        uint256 price,
        uint256 eventUnixTime,
        string memory metadataCID,
        TicketMetadata[] memory metadata
    ) external onlyOrganizer {
        require(recipients.length == metadata.length, "Array mismatch");
        require(eventUnixTime > block.timestamp, "Event must be future");
        require(price > 0, "Price must be > 0");

        for (uint256 i = 0; i < recipients.length; i++) {
            mintTicket(
                recipients[i],
                eventId,
                price,
                eventUnixTime,
                metadataCID,
                metadata[i]
            );
        }
    }

    function invalidateTicket(uint256 tokenId) external onlyOrganizer {
        require(tickets[tokenId].isValid, "Already invalid");
        tickets[tokenId].isValid = false;
    }

    function useTicket(uint256 tokenId) external onlyOrganizer {
        require(tickets[tokenId].isValid, "Invalid ticket");
        require(!usedTickets[tokenId], "Already used");
        require(block.timestamp < tickets[tokenId].eventDate, "Event expired");
        
        usedTickets[tokenId] = true;
        emit TicketUsed(tokenId, ownerOf(tokenId));
    }

    function resellTicket(uint256 tokenId, uint256 newPrice) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(tickets[tokenId].isValid, "Invalid ticket");
        require(block.timestamp < tickets[tokenId].eventDate, "Event expired");
        require(newPrice <= tickets[tokenId].maxResalePrice, "Price exceeded");
        
        tickets[tokenId].currentPrice = newPrice;
        emit TicketResold(tokenId, newPrice);
    }

    function buyTicket(uint256 tokenId) external payable nonReentrant {
        Ticket storage ticket = tickets[tokenId];
        require(ticket.isValid, "Invalid ticket");
        require(!usedTickets[tokenId], "Already used");
        require(msg.value >= ticket.currentPrice, "Insufficient funds");
        require(block.timestamp < ticket.eventDate, "Event expired");

        address seller = ownerOf(tokenId);
        uint256 royalty = (msg.value * royaltyPercent) / 100;
        uint256 sellerShare = msg.value - royalty;

        _transfer(seller, _msgSender(), tokenId);
        ownershipHistory[tokenId].push(_msgSender());

        (bool success1, ) = owner().call{value: royalty}("");
        (bool success2, ) = seller.call{value: sellerShare}("");
        require(success1 && success2, "Payment failed");
        
        emit TicketTransferred(tokenId, seller, _msgSender());
    }

    function setFractionalOwnership(
        uint256 tokenId,
        address[] calldata owners,
        uint256[] calldata shares
    ) external {
        require(ownerOf(tokenId) == _msgSender(), "Not owner");
        require(owners.length == shares.length, "Array mismatch");
        
        uint256 totalShares;
        for (uint256 i = 0; i < shares.length; i++) {
            totalShares += shares[i];
            fractionalOwnership[tokenId][owners[i]] = shares[i];
            emit FractionalOwnershipUpdated(tokenId, owners[i], shares[i]);
        }
        require(totalShares == 100, "Shares must sum to 100");
    }

    function getOwnershipHistory(uint256 tokenId) public view returns (address[] memory) {
        return ownershipHistory[tokenId];
    }

    function verifyTicket(uint256 tokenId) public view returns (
        bool isValid,
        bool isUsed,
        bool isExpired,
        TicketMetadata memory metadata
    ) {
        Ticket storage ticket = tickets[tokenId];
        return (
            ticket.isValid,
            usedTickets[tokenId],
            block.timestamp >= ticket.eventDate,
            ticket.metadata
        );
    }

    function getFractionalOwnership(uint256 tokenId, address owner) public view returns (uint256) {
        return fractionalOwnership[tokenId][owner];
    }
}