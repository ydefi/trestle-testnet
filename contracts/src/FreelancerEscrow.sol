// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./DutchAuctionLib.sol";

contract FreelancerEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using DutchAuctionLib for DutchAuctionLib.Params;

    enum ProjectStatus { Open, InProgress, Completed, Cancelled, Disputed }
    enum PricingMode { Fixed, DutchAuction }
    enum MilestoneStatus { Pending, Submitted, Approved, Rejected }

    struct GigMilestone {
        string description;
        uint256 amount;
        uint256 deadline;
    }

    struct Gig {
        uint256 id;
        address freelancer;
        string title;
        string descriptionURI;
        uint256 price;
        bool active;
        GigMilestone[] milestones;
    }

    struct Milestone {
        string description;
        uint256 amount;
        uint256 deadline;
        MilestoneStatus status;
        uint256 submittedAt;
        string deliveryHash;
    }

    struct Project {
        uint256 id;
        address client;
        address freelancer;
        string title;
        string descriptionURI;
        PricingMode pricing;
        uint256 totalBudget;
        DutchAuctionLib.Params auction;
        ProjectStatus status;
        Milestone[] milestones;
        uint256 escrowedAmount;
        uint256 disputeDeadline;
        uint256 createdAt;
    }

    uint256 public projectCount;
    uint256 public gigCount;
    uint256 public constant PLATFORM_FEE_BPS = 250;
    uint256 public constant BPS = 10000;
    uint256 public constant MILESTONE_APPROVAL_TIMEOUT = 14 days;
    uint256 public constant DISPUTE_TIMEOUT = 7 days;

    mapping(uint256 => Project) public projects;
    mapping(uint256 => Gig) public gigs;

    event ProjectCreated(uint256 indexed id, address indexed client, string title, uint256 budget);
    event ProjectAccepted(uint256 indexed id, address indexed freelancer);
    event MilestoneSubmitted(uint256 indexed id, uint256 milestoneIndex, string deliveryHash);
    event MilestoneApproved(uint256 indexed id, uint256 milestoneIndex, uint256 amount);
    event MilestoneRejected(uint256 indexed id, uint256 milestoneIndex);
    event ProjectCompleted(uint256 indexed id);
    event Disputed(uint256 indexed id);
    event Resolved(uint256 indexed id, bool toFreelancer);
    event Cancelled(uint256 indexed id);
    event GigCreated(uint256 indexed id, address indexed freelancer, string title, uint256 price);
    event GigUpdated(uint256 indexed id);
    event GigCancelled(uint256 indexed id);
    event GigHired(uint256 indexed gigId, uint256 indexed projectId, address indexed client);

    error NotClient();
    error NotFreelancer();
    error NotParticipant();
    error WrongStatus();
    error WrongMilestone();
    error BudgetTooLow();
    error AlreadyAccepted();
    error NoFunds();
    error PastDeadline();

    modifier onlyClient(uint256 _id) {
        if (msg.sender != projects[_id].client) revert NotClient();
        _;
    }

    modifier onlyFreelancer(uint256 _id) {
        if (msg.sender != projects[_id].freelancer) revert NotFreelancer();
        _;
    }

    constructor() Ownable(msg.sender) {}

    function createProjectFixed(
        string calldata _title,
        string calldata _descriptionURI,
        uint256 _totalBudget,
        string[] calldata _milestoneDescriptions,
        uint256[] calldata _milestoneAmounts,
        uint256[] calldata _milestoneDeadlines
    ) external returns (uint256) {
        uint256 len = _milestoneDescriptions.length;
        if (len == 0 || len != _milestoneAmounts.length || len != _milestoneDeadlines.length) revert BudgetTooLow();
        uint256 totalCheck;
        for (uint256 i; i < len; i++) totalCheck += _milestoneAmounts[i];
        if (totalCheck != _totalBudget) revert BudgetTooLow();

        projectCount++;
        uint256 id = projectCount;
        Project storage p = projects[id];
        p.id = id;
        p.client = msg.sender;
        p.title = _title;
        p.descriptionURI = _descriptionURI;
        p.pricing = PricingMode.Fixed;
        p.totalBudget = _totalBudget;
        p.status = ProjectStatus.Open;
        p.createdAt = block.timestamp;

        for (uint256 i; i < len; i++) {
            if (_milestoneDeadlines[i] <= block.timestamp) revert PastDeadline();
            p.milestones.push(Milestone(_milestoneDescriptions[i], _milestoneAmounts[i], _milestoneDeadlines[i], MilestoneStatus.Pending, 0, ""));
        }
        emit ProjectCreated(id, msg.sender, _title, _totalBudget);
        return id;
    }

    function createProjectDutch(
        string calldata _title,
        string calldata _descriptionURI,
        uint256 _maxBudget,
        uint256 _reserveBudget,
        uint256 _duration,
        string[] calldata _milestoneDescriptions,
        uint256[] calldata _milestoneAmounts,
        uint256[] calldata _milestoneDeadlines
    ) external returns (uint256) {
        DutchAuctionLib.validate(_maxBudget, _reserveBudget, _duration);
        uint256 len = _milestoneDescriptions.length;
        if (len == 0 || len != _milestoneAmounts.length || len != _milestoneDeadlines.length) revert BudgetTooLow();
        uint256 totalCheck;
        for (uint256 i; i < len; i++) totalCheck += _milestoneAmounts[i];
        if (totalCheck != _maxBudget) revert BudgetTooLow();

        projectCount++;
        uint256 id = projectCount;
        Project storage p = projects[id];
        p.id = id;
        p.client = msg.sender;
        p.title = _title;
        p.descriptionURI = _descriptionURI;
        p.pricing = PricingMode.DutchAuction;
        p.totalBudget = _maxBudget;
        p.auction = DutchAuctionLib.Params(_maxBudget, _reserveBudget, _duration, block.timestamp);
        p.status = ProjectStatus.Open;
        p.createdAt = block.timestamp;

        for (uint256 i; i < len; i++) {
            if (_milestoneDeadlines[i] <= block.timestamp) revert PastDeadline();
            p.milestones.push(Milestone(_milestoneDescriptions[i], _milestoneAmounts[i], _milestoneDeadlines[i], MilestoneStatus.Pending, 0, ""));
        }
        emit ProjectCreated(id, msg.sender, _title, _maxBudget);
        return id;
    }

    // ─── Gig functions (freelancer-side listings) ───────────────────

    function createGig(
        string calldata _title,
        string calldata _descriptionURI,
        uint256 _price,
        string[] calldata _milestoneDescriptions,
        uint256[] calldata _milestoneAmounts,
        uint256[] calldata _milestoneDeadlines
    ) external returns (uint256) {
        uint256 len = _milestoneDescriptions.length;
        if (len == 0 || len != _milestoneAmounts.length || len != _milestoneDeadlines.length) revert BudgetTooLow();
        uint256 totalCheck;
        for (uint256 i; i < len; i++) totalCheck += _milestoneAmounts[i];
        if (totalCheck != _price) revert BudgetTooLow();

        gigCount++;
        uint256 id = gigCount;
        Gig storage g = gigs[id];
        g.id = id;
        g.freelancer = msg.sender;
        g.title = _title;
        g.descriptionURI = _descriptionURI;
        g.price = _price;
        g.active = true;
        for (uint256 i; i < len; i++) {
            if (_milestoneDeadlines[i] <= block.timestamp) revert PastDeadline();
            g.milestones.push(GigMilestone(_milestoneDescriptions[i], _milestoneAmounts[i], _milestoneDeadlines[i]));
        }
        emit GigCreated(id, msg.sender, _title, _price);
        return id;
    }

    function updateGig(
        uint256 _gigId,
        string calldata _title,
        string calldata _descriptionURI,
        uint256 _price,
        string[] calldata _milestoneDescriptions,
        uint256[] calldata _milestoneAmounts,
        uint256[] calldata _milestoneDeadlines
    ) external {
        Gig storage g = gigs[_gigId];
        if (msg.sender != g.freelancer) revert NotFreelancer();
        if (!g.active) revert WrongStatus();
        uint256 len = _milestoneDescriptions.length;
        if (len == 0 || len != _milestoneAmounts.length || len != _milestoneDeadlines.length) revert BudgetTooLow();
        uint256 totalCheck;
        for (uint256 i; i < len; i++) totalCheck += _milestoneAmounts[i];
        if (totalCheck != _price) revert BudgetTooLow();

        g.title = _title;
        g.descriptionURI = _descriptionURI;
        g.price = _price;
        delete g.milestones;
        for (uint256 i; i < len; i++) {
            g.milestones.push(GigMilestone(_milestoneDescriptions[i], _milestoneAmounts[i], _milestoneDeadlines[i]));
        }
        emit GigUpdated(_gigId);
    }

    function cancelGig(uint256 _gigId) external {
        Gig storage g = gigs[_gigId];
        if (msg.sender != g.freelancer) revert NotFreelancer();
        if (!g.active) revert WrongStatus();
        g.active = false;
        emit GigCancelled(_gigId);
    }

    function hireGig(uint256 _gigId) external payable returns (uint256) {
        Gig storage g = gigs[_gigId];
        if (!g.active) revert WrongStatus();
        if (msg.value < g.price) revert BudgetTooLow();

        projectCount++;
        uint256 id = projectCount;
        Project storage p = projects[id];
        p.id = id;
        p.client = msg.sender;
        p.freelancer = g.freelancer;
        p.title = g.title;
        p.descriptionURI = g.descriptionURI;
        p.pricing = PricingMode.Fixed;
        p.totalBudget = g.price;
        p.status = ProjectStatus.InProgress;
        p.escrowedAmount = g.price;
        p.createdAt = block.timestamp;

        uint256 mlen = g.milestones.length;
        for (uint256 i; i < mlen; i++) {
            p.milestones.push(Milestone(
                g.milestones[i].description,
                g.milestones[i].amount,
                g.milestones[i].deadline,
                MilestoneStatus.Pending, 0, ""
            ));
        }

        uint256 excess = msg.value - g.price;
        if (excess > 0) {
            (bool refund,) = msg.sender.call{value: excess}("");
            require(refund, "Refund failed");
        }

        emit GigHired(_gigId, id, msg.sender);
        emit ProjectCreated(id, msg.sender, g.title, g.price);
        emit ProjectAccepted(id, g.freelancer);
        return id;
    }

    function getGigMilestoneCount(uint256 _gigId) external view returns (uint256) {
        return gigs[_gigId].milestones.length;
    }

    function currentBudget(uint256 _id) public view returns (uint256) {
        Project storage p = projects[_id];
        if (p.pricing == PricingMode.Fixed) return p.totalBudget;
        if (p.freelancer != address(0)) return p.totalBudget;
        return p.auction.currentPrice();
    }

    function fundProject(uint256 _id) external payable nonReentrant onlyClient(_id) {
        Project storage p = projects[_id];
        if (p.status != ProjectStatus.Open) revert WrongStatus();
        uint256 budget = currentBudget(_id);
        if (msg.value < budget) revert BudgetTooLow();
        p.escrowedAmount += budget;
        uint256 excess = msg.value - budget;
        if (excess > 0) {
            (bool refund,) = msg.sender.call{value: excess}("");
            require(refund, "Refund failed");
        }
    }

    function fundProjectWithToken(uint256 _id, address _token, uint256 _amount) external nonReentrant onlyClient(_id) {
        Project storage p = projects[_id];
        if (p.status != ProjectStatus.Open) revert WrongStatus();
        uint256 budget = currentBudget(_id);
        if (_amount < budget) revert BudgetTooLow();
        IERC20(_token).safeTransferFrom(msg.sender, address(this), budget);
        p.escrowedAmount += budget;
        if (_amount > budget) {
            IERC20(_token).safeTransfer(msg.sender, _amount - budget);
        }
    }

    function acceptProject(uint256 _id) external nonReentrant {
        Project storage p = projects[_id];
        if (p.status != ProjectStatus.Open) revert WrongStatus();
        if (p.freelancer != address(0)) revert AlreadyAccepted();
        if (p.escrowedAmount < p.totalBudget) revert NoFunds();

        p.freelancer = msg.sender;
        p.status = ProjectStatus.InProgress;
        emit ProjectAccepted(_id, msg.sender);
    }

    function applyAndAcceptDutch(uint256 _id) external nonReentrant {
        Project storage p = projects[_id];
        if (p.pricing != PricingMode.DutchAuction) revert WrongStatus();
        if (p.status != ProjectStatus.Open) revert WrongStatus();
        if (p.freelancer != address(0)) revert AlreadyAccepted();
        if (p.escrowedAmount < p.totalBudget) revert NoFunds();

        p.freelancer = msg.sender;
        p.status = ProjectStatus.InProgress;
        emit ProjectAccepted(_id, msg.sender);
    }

    function submitMilestone(uint256 _id, uint256 _milestoneIndex, string calldata _deliveryHash) external onlyFreelancer(_id) {
        Project storage p = projects[_id];
        if (p.status != ProjectStatus.InProgress) revert WrongStatus();
        if (_milestoneIndex >= p.milestones.length) revert WrongMilestone();
        Milestone storage m = p.milestones[_milestoneIndex];
        if (m.status != MilestoneStatus.Pending) revert WrongMilestone();
        if (block.timestamp > m.deadline) revert WrongMilestone();

        m.status = MilestoneStatus.Submitted;
        m.submittedAt = block.timestamp;
        m.deliveryHash = _deliveryHash;
        emit MilestoneSubmitted(_id, _milestoneIndex, _deliveryHash);
    }

    function approveMilestone(uint256 _id, uint256 _milestoneIndex) external onlyClient(_id) nonReentrant {
        Project storage p = projects[_id];
        if (p.status != ProjectStatus.InProgress && p.status != ProjectStatus.Open) revert WrongStatus();
        if (_milestoneIndex >= p.milestones.length) revert WrongMilestone();
        Milestone storage m = p.milestones[_milestoneIndex];
        if (m.status != MilestoneStatus.Submitted) revert WrongMilestone();

        p.status = ProjectStatus.InProgress;
        m.status = MilestoneStatus.Approved;
        uint256 amount = m.amount;
        if (p.escrowedAmount < amount) revert NoFunds();
        p.escrowedAmount -= amount;
        uint256 fee = (amount * PLATFORM_FEE_BPS) / BPS;
        uint256 netAmount = amount - fee;
        if (fee > 0) {
            (bool feeSent,) = owner().call{value: fee}("");
            require(feeSent, "Fee transfer failed");
        }
        (bool sent,) = p.freelancer.call{value: netAmount}("");
        require(sent, "Payment failed");

        emit MilestoneApproved(_id, _milestoneIndex, amount);

        bool allDone = true;
        for (uint256 i; i < p.milestones.length; i++) {
            if (p.milestones[i].status != MilestoneStatus.Approved) {
                allDone = false;
                break;
            }
        }
        if (allDone) {
            p.status = ProjectStatus.Completed;
            if (p.escrowedAmount > 0) {
                uint256 remaining = p.escrowedAmount;
                p.escrowedAmount = 0;
                (bool bonus,) = p.freelancer.call{value: remaining}("");
                require(bonus, "Bonus failed");
            }
            emit ProjectCompleted(_id);
        }
    }

    function rejectMilestone(uint256 _id, uint256 _milestoneIndex) external onlyClient(_id) {
        Project storage p = projects[_id];
        if (p.status != ProjectStatus.InProgress) revert WrongStatus();
        if (_milestoneIndex >= p.milestones.length) revert WrongMilestone();
        Milestone storage m = p.milestones[_milestoneIndex];
        if (m.status != MilestoneStatus.Submitted) revert WrongMilestone();

        m.status = MilestoneStatus.Rejected;
        emit MilestoneRejected(_id, _milestoneIndex);
    }

    function autoApproveMilestone(uint256 _id, uint256 _milestoneIndex) external nonReentrant {
        Project storage p = projects[_id];
        if (_milestoneIndex >= p.milestones.length) revert WrongMilestone();
        Milestone storage m = p.milestones[_milestoneIndex];
        if (m.status != MilestoneStatus.Submitted) revert WrongMilestone();
        if (block.timestamp < m.submittedAt + MILESTONE_APPROVAL_TIMEOUT) revert WrongMilestone();

        m.status = MilestoneStatus.Approved;
        uint256 amount = m.amount;
        if (p.escrowedAmount < amount) revert NoFunds();
        p.escrowedAmount -= amount;
        uint256 fee = (amount * PLATFORM_FEE_BPS) / BPS;
        uint256 netAmount = amount - fee;
        if (fee > 0) {
            (bool feeSent,) = owner().call{value: fee}("");
            require(feeSent, "Fee transfer failed");
        }
        (bool sent,) = p.freelancer.call{value: netAmount}("");
        require(sent, "Payment failed");

        emit MilestoneApproved(_id, _milestoneIndex, amount);
    }

    function disputeProject(uint256 _id) external {
        Project storage p = projects[_id];
        if (msg.sender != p.client && msg.sender != p.freelancer) revert NotParticipant();
        if (p.status != ProjectStatus.InProgress && p.status != ProjectStatus.Open) revert WrongStatus();

        p.status = ProjectStatus.Disputed;
        p.disputeDeadline = block.timestamp + DISPUTE_TIMEOUT;
        emit Disputed(_id);
    }

    function resolveDispute(uint256 _id, bool _toFreelancer) external onlyOwner nonReentrant {
        Project storage p = projects[_id];
        if (p.status != ProjectStatus.Disputed) revert WrongStatus();

        p.status = ProjectStatus.Completed;
        uint256 amount = p.escrowedAmount;
        p.escrowedAmount = 0;
        address recipient = _toFreelancer ? p.freelancer : p.client;
        if (amount > 0) {
            (bool sent,) = recipient.call{value: amount}("");
            require(sent, "Transfer failed");
        }
        emit Resolved(_id, _toFreelancer);
    }

    function autoResolveDispute(uint256 _id) external nonReentrant {
        Project storage p = projects[_id];
        if (p.status != ProjectStatus.Disputed) revert WrongStatus();
        if (block.timestamp < p.disputeDeadline) revert WrongStatus();

        uint256 approvedCount;
        for (uint256 i; i < p.milestones.length; i++) {
            if (p.milestones[i].status == MilestoneStatus.Approved) {
                approvedCount++;
            }
        }

        p.status = ProjectStatus.Completed;
        uint256 amount = p.escrowedAmount;
        p.escrowedAmount = 0;

        if (approvedCount > p.milestones.length / 2) {
            (bool sent,) = p.freelancer.call{value: amount}("");
            require(sent, "Transfer failed");
            emit Resolved(_id, true);
        } else {
            (bool sent,) = p.client.call{value: amount}("");
            require(sent, "Transfer failed");
            emit Resolved(_id, false);
        }
    }

    function cancelProject(uint256 _id) external nonReentrant onlyClient(_id) {
        Project storage p = projects[_id];
        if (p.status != ProjectStatus.Open) revert WrongStatus();

        p.status = ProjectStatus.Cancelled;
        uint256 amount = p.escrowedAmount;
        p.escrowedAmount = 0;
        if (amount > 0) {
            (bool sent,) = msg.sender.call{value: amount}("");
            require(sent, "Refund failed");
        }
        emit Cancelled(_id);
    }

    function getMilestoneCount(uint256 _id) external view returns (uint256) {
        return projects[_id].milestones.length;
    }
}
