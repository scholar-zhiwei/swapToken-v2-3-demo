// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract IMP is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;
    using Counters for Counters.Counter;

    string public baseURI;
    string public baseUriSuffix= ".json";

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant FOUNDERS_SUPPLY = 900;
    uint256 public constant FREE_SALE_SUPPLY = 3000;
    uint256 public constant PRE_SALE_SUPPLY = 1000;
    uint256 public constant CASHIER_SALE_SUPPLY = 5000;
    uint256 public constant VIP_SERVICE_SALE_SUPPLY = 5000;

    uint256 public constant SET_WL_SALE_TIME = 0;
    uint256 public constant SET_FREE_SALE_TIME = 1;
    uint256 public constant SET_CASHIER_SALE_TIME = 2;

    Counters.Counter public totalSupply;

    // Founders
    uint256 public foundersAmountMinted;

    // WL MINT
    uint256 public wlSaleStartTime;
    uint256 public wlSaleEndTime;
    mapping(address => uint256) public whitelistClaimed;
    bytes32 private merkleRoot;
    uint256 public preSaleAmountMinted;

    //FREE MINT
    uint256 public freeSaleStartTime;
    uint256 public freeSaleEndTime;
    uint256 public freeSaleAmountMinted;
    mapping(address => uint256) public freeSaleClaimed;
    uint256 public constant FREE_SALE_MINT_LIMIT = 1;

    //CASHIER
    uint256 public cashierSaleStartTime;
    uint256 public cashierSaleEndTime;
    uint256 public cashierSaleAmountMinted;
    mapping(address => uint256) public cashierSaleClaimed;
    uint256 public cashierSaleStartPrice = 0.05 ether;
    uint256 public constant CASHIER_SALE_MINT_LIMIT = 2;

    //VIP SERVICE
    uint256 public vipServiceSaleStartPrice = 1 ether;

    error DirectMintFromContractNotAllowed();
    error PublicSaleInactive();
    error ExceedsCashierMaxSupply();
    error ExceedsFreeMaxSupply();
    error ExceedsVipServiceMaxSupply();
    error ExceedsAllocatedForFreeSale();
    error InvalidAmount();
    error WithdrawalFailed();
    error ExceedsAllocatedForFounders();
    error PreSaleInactive();
    error InsufficientETHSent();
    error NotOnWhitelist();
    error ExceedsPreSaleSupply();
    error ExceedsAllocatedForPreSale();

    event Minted(uint256 remainingSupply);

    modifier callerIsUser() {
        if (tx.origin != msg.sender)
            revert DirectMintFromContractNotAllowed();
        _;
    }

    function getRemainingSupply() public view returns (uint256) {
        unchecked { return MAX_SUPPLY - totalSupply.current(); }
    }

    function isSaleLive(uint startTime,uint endTime) public view returns (bool) {
        return
            startTime > 0 && block.timestamp >= startTime && block.timestamp < endTime;
    }   

    function wlPreSaleBuy(
        bytes32[] memory _merkleproof,
        uint256 allowedMintQuantity,
        uint256 mintQuantity
    ) external payable nonReentrant callerIsUser {
        if (!isSaleLive(wlSaleStartTime,wlSaleEndTime))
            revert PreSaleInactive();

        if (preSaleAmountMinted + mintQuantity > PRE_SALE_SUPPLY)
            revert ExceedsPreSaleSupply();

        if (whitelistClaimed[msg.sender] + mintQuantity > allowedMintQuantity)
            revert ExceedsAllocatedForPreSale();

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, allowedMintQuantity));
        if (!MerkleProof.verify(_merkleproof, merkleRoot, leaf))
            revert NotOnWhitelist();

        unchecked {
            preSaleAmountMinted += mintQuantity;
            whitelistClaimed[msg.sender] += mintQuantity;
        }

        for (uint256 i; i < mintQuantity;) {
            totalSupply.increment();
            _mint(msg.sender, totalSupply.current());
            unchecked { ++i; }
        }

        emit Minted(getRemainingSupply());
    }

    function freeSaleBuy(uint mintQuantity)
        external
        payable
        nonReentrant
        callerIsUser
    {
        if (mintQuantity == 0)
            revert InvalidAmount();

        if (!isSaleLive(freeSaleStartTime,freeSaleEndTime))
            revert PublicSaleInactive();

        if (freeSaleAmountMinted + mintQuantity > FREE_SALE_SUPPLY)
            revert ExceedsFreeMaxSupply();

        if (freeSaleClaimed[msg.sender] + mintQuantity > FREE_SALE_MINT_LIMIT)
            revert ExceedsAllocatedForFreeSale();

        unchecked {
            freeSaleAmountMinted += mintQuantity;
            freeSaleClaimed[msg.sender] += mintQuantity;
        }

        totalSupply.increment();
        _mint(msg.sender, totalSupply.current());

        emit Minted(getRemainingSupply());
    }

    function cashierSaleBuy(uint256 mintQuantity)
        external
        payable
        nonReentrant
        callerIsUser
    {
        if (!isSaleLive(cashierSaleStartTime,cashierSaleEndTime))
            revert PublicSaleInactive();

        if (cashierSaleAmountMinted + mintQuantity > CASHIER_SALE_MINT_LIMIT)
            revert ExceedsCashierMaxSupply();

        if (cashierSaleClaimed[msg.sender] + mintQuantity > CASHIER_SALE_MINT_LIMIT)
            revert ExceedsAllocatedForFreeSale();

        if (msg.value < cashierSaleStartPrice)
            revert InsufficientETHSent();

        unchecked {
            cashierSaleAmountMinted += mintQuantity;
            cashierSaleClaimed[msg.sender] += mintQuantity;
        }

        for (uint256 i; i < mintQuantity;) {
            totalSupply.increment();
            _mint(msg.sender, totalSupply.current());
            unchecked { ++i; }
        }
        emit Minted(getRemainingSupply());
    }

    function vipServiceSaleBuy(uint256 mintQuantity)
        external
        payable
        nonReentrant
        callerIsUser
    {
        if (cashierSaleAmountMinted + mintQuantity > VIP_SERVICE_SALE_SUPPLY)
            revert ExceedsVipServiceMaxSupply();

        if (msg.value < cashierSaleStartPrice)
            revert InsufficientETHSent();

        unchecked {
            cashierSaleAmountMinted += mintQuantity;
            cashierSaleClaimed[msg.sender] += mintQuantity;
        }

        for (uint256 i; i < mintQuantity;) {
            totalSupply.increment();
            _mint(msg.sender, totalSupply.current());
            unchecked { ++i; }
        }
        emit Minted(getRemainingSupply());
    }

    function foundersMint(uint mintQuantity)
        external
        onlyOwner
        nonReentrant
    {
        if (foundersAmountMinted + mintQuantity > FOUNDERS_SUPPLY)
            revert ExceedsAllocatedForFounders();

        for (uint256 i; i < mintQuantity;) {
            totalSupply.increment();
            _mint(msg.sender, totalSupply.current());
            unchecked { ++i; }
        }

        unchecked { foundersAmountMinted += mintQuantity; }

        emit Minted(getRemainingSupply());
    }

    function withdraw() external onlyOwner nonReentrant {
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");

        if (!success)
            revert WithdrawalFailed();
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId),"ERC721Metadata: URI query for nonexistent token");
        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0
            ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseUriSuffix))
            : "";
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string calldata _uri) external onlyOwner {
        baseURI = _uri;
    }

    //flag = 0: wlSale, flag = 1: freeSale, flag = 2:cashierSale
    function setSaleTime(uint256 _startTime,uint256 _endTime,uint flag) external onlyOwner {
        if(flag == SET_WL_SALE_TIME){
            wlSaleStartTime = _startTime;
            wlSaleEndTime = _endTime;
        }else if(flag == SET_FREE_SALE_TIME){
            freeSaleStartTime = _startTime;
            freeSaleEndTime = _endTime;
        }else if(flag == SET_CASHIER_SALE_TIME){
            cashierSaleStartTime = _startTime;
            cashierSaleEndTime = _endTime;
        }
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

}
