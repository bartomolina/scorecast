// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./dev/functions/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

//  _                _                        _ _                   _   _
// | |              | |                      | (_)                 | | | |
// | |__   __ _ _ __| |_ ___  _ __ ___   ___ | |_ _ __   __ _   ___| |_| |__
// | '_ \ / _` | '__| __/ _ \| '_ ` _ \ / _ \| | | '_ \ / _` | / _ \ __| '_ \
// | |_) | (_| | |  | || (_) | | | | | | (_) | | | | | | (_| ||  __/ |_| | | |
// |_.__/ \__,_|_|   \__\___/|_| |_| |_|\___/|_|_|_| |_|\__,_(_)___|\__|_| |_|
//

contract ScoreCast is FunctionsClient, ConfirmedOwner {
  using Functions for Functions.Request;

  struct FixtureInfo {
    uint256 startTime;
    uint256 endTime;
  }

  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;

  mapping (bytes32 => string) requestToFixture;

  mapping (string => FixtureInfo) fixtureToFixtureInfo;
  mapping (string => mapping (address => mapping(uint => uint))) fixtureToBets;
  mapping (string => mapping (address => mapping(uint => uint))) fixtureToClaims;
  mapping (string => mapping (uint => uint)) fixtureToTotalBets;
  mapping (string => bytes) fixtureToResults;
  string[] activePools;

  string source = "return Functions.encodeUint256(123)";
  bytes secrets;
  uint64 subscriptionId = 234;
  uint32 gasLimit = 300000;

  constructor(address oracle) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {}

  event RequestExecuted(bytes32 assignedReqID, string fixtureId);

  function executeRequest(
    string[] calldata fixtureId
  ) external returns (bytes32) {
    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);
    if (secrets.length > 0) {
      req.addInlineSecrets(secrets);
    }
    req.addArgs(fixtureId);

    bytes32 assignedReqID = sendRequest(req, subscriptionId, gasLimit);
    latestRequestId = assignedReqID;
    requestToFixture[assignedReqID] = fixtureId[0];
    emit RequestExecuted(assignedReqID, fixtureId[0]);
    return assignedReqID;
  }

  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

  function fulfillRequest(
    bytes32 requestId,
    bytes memory response,
    bytes memory err
  ) internal override {
    latestResponse = response;
    latestError = err;
    string memory fixtureId = requestToFixture[requestId];
    fixtureToResults[fixtureId] = response;
    emit OCRResponse(requestId, response, err);
  }

  function updateOracleAddress(address oracle) public onlyOwner {
    setOracle(oracle);
  }

  function addSimulatedRequestId(address oracleAddress, bytes32 requestId) public onlyOwner {
    addExternalRequest(oracleAddress, requestId);
  }

  // ScoreCast functions
  function setSource(string calldata _source) external onlyOwner {
    source = _source;
  }

  function setSecrets(bytes calldata _secrets) external onlyOwner {
    secrets = _secrets;
  }

  function setSubscriptionId(uint64 _subscriptionId) external onlyOwner {
    subscriptionId = _subscriptionId;
  }

  event BetPlaced(string indexed fixtureId, address indexed _address, uint bet, uint value);

  function placeBet(string calldata fixtureId, uint bet, uint256 startTime, uint256 endTime) external payable {
    require(startTime > block.timestamp, "Match starting time should be in the future");
    if (fixtureToTotalBets[fixtureId][1] == 0 && fixtureToTotalBets[fixtureId][2] == 0) {
      activePools.push(fixtureId);
      FixtureInfo memory fixtureInfo = FixtureInfo(startTime, endTime);
      fixtureToFixtureInfo[fixtureId] = fixtureInfo;
    }

    fixtureToBets[fixtureId][msg.sender][bet] += msg.value;
    fixtureToTotalBets[fixtureId][bet] += msg.value;
    emit BetPlaced(fixtureId, msg.sender, bet, msg.value);
  }

  function getResult(string calldata fixtureId) public view returns(bytes memory){
    return fixtureToResults[fixtureId];
  }

  function getBets(string calldata fixtureId) public view returns(uint, uint){
    return (fixtureToTotalBets[fixtureId][1], fixtureToTotalBets[fixtureId][2]);
  }

  function getUserBets(string calldata fixtureId, address user) public view returns(uint, uint, uint, uint){
    return (fixtureToBets[fixtureId][user][1], fixtureToBets[fixtureId][user][2], fixtureToClaims[fixtureId][user][1], fixtureToClaims[fixtureId][user][2]);
  }

  function getFixtureData(string calldata fixtureId, address user) public view returns(
    FixtureInfo memory fixtureInfo,
    uint totalHome,
    uint totalAway,
    uint ownHome,
    uint ownHomeClaimed,
    uint ownAway,
    uint ownAwayClaimed,
    bytes memory result){
    fixtureInfo = fixtureToFixtureInfo[fixtureId];
    (totalHome, totalAway) = getBets(fixtureId);
    (ownHome, ownAway, ownHomeClaimed, ownAwayClaimed) = getUserBets(fixtureId, user);
    result = getResult(fixtureId);
  }

  event Withdraw(string indexed fixtureId, address indexed _address, uint value);

  function withdraw(string calldata fixtureId) external {
    require(fixtureToFixtureInfo[fixtureId].endTime < block.timestamp, "Match hasn't finished yet");
    uint calculatedAmount = claimableAmount(fixtureId);

    if (calculatedAmount > 0) {
      (bool success, ) = payable(msg.sender).call{value: calculatedAmount}("");
      require(success);
    }

    emit Withdraw(fixtureId, msg.sender, calculatedAmount);
  }

  function claimableAmount(string calldata fixtureId) public returns(uint){
    (uint totalHome, uint totalAway) = getBets(fixtureId);
    uint result = uint(bytes32(fixtureToResults[fixtureId]));
    uint ownAmount = fixtureToBets[fixtureId][msg.sender][result];
    uint calculatedAmount;

    if (result == 1 && totalAway > 0) {
      calculatedAmount = ownAmount * (totalHome + totalAway) / totalHome;
    }
    
    if (result == 2 && totalHome > 0) {
      calculatedAmount = ownAmount * (totalHome + totalAway) / totalAway;
    }

    require(fixtureToClaims[fixtureId][msg.sender][result] == 0, "Already claimed");
    fixtureToClaims[fixtureId][msg.sender][result] = calculatedAmount;

    return calculatedAmount;
  }

  function getActivePools() external view returns (string[] memory) {
    return activePools;
  }

  // Test
  function getFixtureInfo(string calldata fixtureId) external view returns(FixtureInfo memory) {
    return fixtureToFixtureInfo[fixtureId];
  }

  function getRequest(bytes32 requestId) external view returns(string memory){
    return requestToFixture[requestId];
  }

  function getSource() external view returns(string memory){
    return source;
  }

  function setResult(string calldata fixtureId, uint result) external onlyOwner {
    fixtureToResults[fixtureId] = abi.encodePacked(result);
  }
}
