// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract MyERC721 is Context, ERC165, IERC721, IERC721Metadata {
    using Address for address;

    // Token name and symbol
    string private _name;
    string private _symbol;

    // Token storage mappings
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Token URI storage
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    // ✅ Implements ERC165 interface check
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IERC721).interfaceId ||
               interfaceId == type(IERC721Metadata).interfaceId ||
               super.supportsInterface(interfaceId);
    }

    // ✅ Returns balance of a given address
    function balanceOf(address owner) public view override returns (uint256) {
        require(owner != address(0), "ERC721: balance query for the zero address");
        return _balances[owner];
    }

    // ✅ Returns owner of a specific token
    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "ERC721: owner query for nonexistent token");
        return owner;
    }

    // ✅ Returns token name
    function name() public view override returns (string memory) {
        return _name;
    }

    // ✅ Returns token symbol
    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    // ✅ Returns token URI (metadata location)
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_owners[tokenId] != address(0), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    // ✅ Approve an address to manage a specific token
    function approve(address to, uint256 tokenId) public override {
        address owner = ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");
        require(_msgSender() == owner || isApprovedForAll(owner, _msgSender()), "ERC721: approve caller is not owner nor approved for all");
        _approve(to, tokenId);
    }

    // ✅ Get approved address for a token
    function getApproved(uint256 tokenId) public view override returns (address) {
        require(_owners[tokenId] != address(0), "ERC721: approved query for nonexistent token");
        return _tokenApprovals[tokenId];
    }

    // ✅ Set approval for all tokens of a user
    function setApprovalForAll(address operator, bool approved) public override {
        require(operator != _msgSender(), "ERC721: approve to caller");
        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    // ✅ Check if an operator is approved for all tokens of an owner
    function isApprovedForAll(address owner, address operator) public view override returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    // ✅ Transfer token ownership
    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }

    // ✅ Safe transfer with no extra data
    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        safeTransferFrom(from, to, tokenId, "");
    }

    // ✅ Safe transfer with additional data
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, data);
    }

    // ✅ Internal safe transfer
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal {
        _transfer(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    // ✅ Internal transfer function
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "ERC721: transfer of token that is not owned");
        require(to != address(0), "ERC721: transfer to the zero address");

        _approve(address(0), tokenId);
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    // ✅ Internal approve function
    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    // ✅ Internal check for approved user
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    // ✅ Check if contract supports ERC721Receiver
   function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) 
    private returns (bool) {
    uint256 size;
    assembly {
        size := extcodesize(to) // Check if address has contract code
    }
    if (size > 0) {
        try IERC721Receiver(to).onERC721Received(_msgSender(), from, tokenId, data) 
        returns (bytes4 retval) {
            return retval == IERC721Receiver.onERC721Received.selector;
        } catch {
            return false;
        }
    } else {
        return true;
    }
}


    // ✅ Internal mint function (allows minting new tokens)
    function _mint(address to, uint256 tokenId, string memory uri) internal {
        require(to != address(0), "ERC721: mint to the zero address");
        require(_owners[tokenId] == address(0), "ERC721: token already minted");

        _balances[to] += 1;
        _owners[tokenId] = to;
        _tokenURIs[tokenId] = uri;

        emit Transfer(address(0), to, tokenId);
    }
} 
