// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./dev/functions/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract ScoreCast is FunctionsClient, ConfirmedOwner {
  using Functions for Functions.Request;

  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;

  mapping (bytes32 => string) requestToFixture;
  mapping (string => mapping (string => uint)) fixtureToTotalBets;
  mapping (string => mapping (address => mapping(string => uint))) fixtureToBets;
  mapping (string => bytes) fixtureToResults;

  string source = "return Functions.encodeUint256(123)";
  bytes secrets;
  uint64 subscriptionId = 234;
  uint32 gasLimit = 300000;

  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);
  event RequestExecuted(bytes32 assignedReqID, string fixtureId);
  event FulfillingRequest(string fixtureId);
  event FulfillingRequest2(bytes response);
  event FulfillingRequest3(string fixtureId, bytes response);

  constructor(address oracle) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {}

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

  function placeBet(string calldata fixtureId, string calldata bet) external payable {
    fixtureToBets[fixtureId][msg.sender][bet] = msg.value;
    fixtureToTotalBets[fixtureId][bet] += msg.value;
  }

  function getResult(string calldata fixtureId) external view returns(bytes memory){
    return fixtureToResults[fixtureId];
  }

  function getBets(string calldata fixtureId) external view returns(uint, uint){
    return (fixtureToTotalBets[fixtureId]["1"], fixtureToTotalBets[fixtureId]["2"]);
  }

  // withdraw

  // Test
  function getRequest(bytes32 requestId) external view returns(string memory){
    return requestToFixture[requestId];
  }

  function setResult(string calldata fixtureId, string calldata result) external {
    fixtureToResults[fixtureId] = bytes(result);
  }

  function getSource() external view returns(string memory){
    return source;
  }
}
