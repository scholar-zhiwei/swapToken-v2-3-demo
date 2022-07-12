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
    string public baseUriSuffix = ".json";

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant FOUNDERS_SUPPLY = 900;
    uint256 public constant FREE_SALE_SUPPLY = 3000;
    uint256 public constant PRE_SALE_SUPPLY = 1000;
    uint256 public constant CASHIER_SALE_SUPPLY = 5000;
    uint256 public constant VIP_SERVICE_SALE_SUPPLY = 100;

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
    uint256 public vipServiceSaleStartTime;
    uint256 public vipServiceSaleStartPrice = 1 ether;
    uint256 public vipServiceSaleAmountMinted;

    error DirectMintFromContractNotAllowed();
    error PublicSaleInactive();
    error ExceedsCashierMaxSupply();
    error ExceedsFreeMaxSupply();
    error ExceedsVipServiceMaxSupply();
    error ExceedsAllocatedForFreeSale();
    error WithdrawalFailed();
    error ExceedsAllocatedForFounders();
    error SaleInactive();
    error InsufficientETHSent();
    error NotOnWhitelist();
    error ExceedsPreSaleSupply();
    error ExceedsAllocatedForPreSale();

    event Minted(uint256 remainingSupply);

    modifier callerIsUser() {
        if (tx.origin != msg.sender) revert DirectMintFromContractNotAllowed();
        _;
    }

    function getRemainingSupply() public view returns (uint256) {
        unchecked {
            return MAX_SUPPLY - totalSupply.current();
        }
    }

    function wlPreSaleBuy(
        bytes32[] memory _merkleproof,
        uint256 allowedMintQuantity,
        uint256 mintQuantity
    ) external nonReentrant callerIsUser {
        if (!isWithinTimeOfWl()) revert SaleInactive();

        if (preSaleAmountMinted + mintQuantity > PRE_SALE_SUPPLY) revert ExceedsPreSaleSupply();

        if (whitelistClaimed[msg.sender] + mintQuantity > allowedMintQuantity)
            revert ExceedsAllocatedForPreSale();

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, allowedMintQuantity));
        if (!MerkleProof.verify(_merkleproof, merkleRoot, leaf)) revert NotOnWhitelist();

        unchecked {
            preSaleAmountMinted += mintQuantity;
            whitelistClaimed[msg.sender] += mintQuantity;
        }

        for (uint256 i; i < mintQuantity; ) {
            totalSupply.increment();
            _mint(msg.sender, totalSupply.current());
            unchecked {
                ++i;
            }
        }

        emit Minted(getRemainingSupply());
    }

    function freeSaleBuy() external nonReentrant callerIsUser {
        if (!isWithinTimeOfFree()) revert SaleInactive();

        if (freeSaleAmountMinted + 1 > FREE_SALE_SUPPLY) revert ExceedsFreeMaxSupply();

        if (freeSaleClaimed[msg.sender] + 1 > FREE_SALE_MINT_LIMIT)
            revert ExceedsAllocatedForFreeSale();

        unchecked {
            freeSaleAmountMinted += 1;
            freeSaleClaimed[msg.sender] += 1;
        }

        totalSupply.increment();
        _mint(msg.sender, totalSupply.current());

        emit Minted(getRemainingSupply());
    }

    function cashierSaleBuy(uint256 mintQuantity) external payable nonReentrant callerIsUser {
        if (!isWithinTimeOfCashier()) revert SaleInactive();

        if (cashierSaleAmountMinted + mintQuantity > CASHIER_SALE_MINT_LIMIT)
            revert ExceedsCashierMaxSupply();

        if (cashierSaleClaimed[msg.sender] + mintQuantity > CASHIER_SALE_MINT_LIMIT)
            revert ExceedsAllocatedForFreeSale();

        if (msg.value < cashierSaleStartPrice * mintQuantity) revert InsufficientETHSent();

        unchecked {
            cashierSaleAmountMinted += mintQuantity;
            cashierSaleClaimed[msg.sender] += mintQuantity;
        }

        for (uint256 i; i < mintQuantity; ) {
            totalSupply.increment();
            _mint(msg.sender, totalSupply.current());
            unchecked {
                ++i;
            }
        }
        emit Minted(getRemainingSupply());
    }

    function vipServiceSaleBuy(uint256 mintQuantity) external payable nonReentrant callerIsUser {
        if (!isWithinTimeOfVipService()) revert SaleInactive();

        if (vipServiceSaleAmountMinted + mintQuantity > VIP_SERVICE_SALE_SUPPLY)
            revert ExceedsVipServiceMaxSupply();

        if (msg.value < vipServiceSaleStartPrice * mintQuantity) revert InsufficientETHSent();

        unchecked {
            vipServiceSaleAmountMinted += mintQuantity;
        }

        for (uint256 i; i < mintQuantity; ) {
            totalSupply.increment();
            _mint(msg.sender, totalSupply.current());
            unchecked {
                ++i;
            }
        }
        emit Minted(getRemainingSupply());
    }

    function foundersMint(uint256 mintQuantity) external onlyOwner nonReentrant {
        if (foundersAmountMinted + mintQuantity > FOUNDERS_SUPPLY)
            revert ExceedsAllocatedForFounders();

        for (uint256 i; i < mintQuantity; ) {
            totalSupply.increment();
            _mint(msg.sender, totalSupply.current());
            unchecked {
                ++i;
            }
        }

        unchecked {
            foundersAmountMinted += mintQuantity;
        }

        emit Minted(getRemainingSupply());
    }

    function foundersMintOneTo(address[] calldata addressArr) external onlyOwner nonReentrant {
        if (foundersAmountMinted + addressArr.length > FOUNDERS_SUPPLY)
            revert ExceedsAllocatedForFounders();

        for (uint256 i; i < addressArr.length; ) {
            totalSupply.increment();
            _mint(addressArr[i], totalSupply.current());
            unchecked {
                ++i;
            }
        }

        unchecked {
            foundersAmountMinted += addressArr.length;
        }
        emit Minted(getRemainingSupply());
    }

    function withdraw() external onlyOwner nonReentrant {
        (bool success, ) = payable(msg.sender).call{ value: address(this).balance }("");

        if (!success) revert WithdrawalFailed();
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);
        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseUriSuffix))
                : "";
    }

    function isWithinTimeOfWl() public view returns (bool) {
        return
            wlSaleStartTime > 0 &&
            block.timestamp >= wlSaleStartTime &&
            block.timestamp < wlSaleEndTime;
    }

    function isWithinTimeOfFree() public view returns (bool) {
        return
            freeSaleStartTime > 0 &&
            block.timestamp >= freeSaleStartTime &&
            block.timestamp < freeSaleEndTime;
    }

    function isWithinTimeOfCashier() public view returns (bool) {
        return
            cashierSaleStartTime > 0 &&
            block.timestamp >= cashierSaleStartTime &&
            block.timestamp < cashierSaleEndTime;
    }

     function isWithinTimeOfVipService() public view returns (bool) {
        return
            vipServiceSaleStartTime > 0 &&
            block.timestamp >= vipServiceSaleStartTime;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string calldata _uri) external onlyOwner {
        baseURI = _uri;
    }

    function setWlSaleTime(uint256 _startTime, uint256 _endTime) external onlyOwner {
        wlSaleStartTime = _startTime;
        wlSaleEndTime = _endTime;
    }

    function setFreeSaleTime(uint256 _startTime, uint256 _endTime) external onlyOwner {
        freeSaleStartTime = _startTime;
        freeSaleEndTime = _endTime;
    }

    function setCashierSaleTime(uint256 _startTime, uint256 _endTime) external onlyOwner {
        cashierSaleStartTime = _startTime;
        cashierSaleEndTime = _endTime;
    }

    function setVipServiceSaleTime(uint256 _startTime) external onlyOwner {
        vipServiceSaleStartTime = _startTime;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }
}
