import React, { Component } from 'react';
import Factory from './Factory.js'; 
import TokenABI from './TokenABI.js';
import Web3 from 'web3'  
import './App.css';

function TokenSelectorSingleRow(props) {
  var activeFactory = props.activeFactory;
  var tokensInRow = props.tokensInRow;

  var link = ""

  return (
    tokensInRow.map((token) => {
      var link = "?factory=" + token;
      var isActiveFactory = (token === activeFactory);

      if (isActiveFactory) {
        return (
          <td key={token} className="factory-selector-active"><div className="factory-selector-active"><b>{token}</b></div></td>
        )
      } else {
        return (
          <td key={token}><a href= {link}><b>{token}</b></a></td>
        )
      }
    })
  )
}


function TokenSelectorRows(props) {
  var tokenRows = [];

  tokenRows.push([]);

  var activeFactory = props.activeFactory;

  var tokensPerRow = 7;

  var tokenKeys = Object.keys(Factory.tokens);

  for (var i = 0; i < tokenKeys.length; i++) {
    if (tokenRows[tokenRows.length - 1].length == tokensPerRow) {
      tokenRows.push([]);
    }

    var key = tokenKeys[i];

    tokenRows[tokenRows.length - 1].push(key);
  }

  return (
      tokenRows.map((row, index) => {
        return (
          <tr key={index}>
          <TokenSelectorSingleRow tokensInRow={row} activeFactory={activeFactory}/>
          </tr>
        )        
      })
  );
}

function GetTime(block) {
  return (
    "-" // TODO
  )
}

function EventRow(e, myAddress) {
  
  let txLink = "https://etherscan.io/tx/" + e.tx;
  let blockLink = "https://etherscan.io/block/" + e.block;
  let providerLink = "https://etherscan.io/address/" + e.provider;
  let rowClassName = "";

  if (e.provider.toUpperCase() === myAddress.toUpperCase()) {
    rowClassName = "myTransaction";
  }

  return (
    <tr key={e.tx} className={rowClassName}>
      <td><a href={txLink} target="_blank"><div className="truncate">{e.tx}</div></a></td>
      <td><a href={blockLink} target="_blank">{e.block}</a></td>
      <td>{GetTime(e.block)}</td>
      <td><a href={providerLink} target="_blank"><div className="truncate">{e.provider}</div></a></td>
      <td>{e.type}</td>
      <td>{e.numEth}</td>
      <td>{e.numTokens}</td>
      <td>{e.curPoolShare}</td>
      <td>{e.liquidtyProviderFee}</td>
    </tr>
  );
}

function EventTableBody(props) {
  let eventList = props.eventList;

  return eventList.map(e => {
    return (
      EventRow(e, props.myAddress)
    )
  });
}

function EventTable(props) {
  return (  
  <table>
    <thead>
    <tr>
    <th>Transaction</th>
    <th>Block</th>
    <th>Time</th>
    <th>Address</th>
    <th>Event</th>
    <th>Pool Adjustment (ETH)</th>
    <th>Pool Adjustment ({props.curFactory})</th>
    <th>Pool Share</th>
    <th>Provider Fee</th>
    </tr>
    </thead>
   <tbody>
    {EventTableBody(props)}
  </tbody>
  </table>
  )
}

class App extends React.Component {  
  constructor() {
    super(); 

    this.appName = 'Uniswap Events'; 
    this.isWeb3 = true;
    this.isWeb3Locked = false; //If metamask account is locked
    
    this.providerFeePercent = 0;

    this.curEthPoolTotal = "";
    this.curTokenPoolTotal = "";
    this.curPoolShare = "";

    this.eventList = [];

    this.myAddress = "";
    this.myCollectedEthFees = "";
    this.myCollectedTokenFees = "";
    
    var factory = Factory.initial;

    // extract factory token from URL if found
    var urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has("factory")) {
      factory = urlParams.get("factory");
    }

    this.state = {
      myAddress : "Locked",

      curEthPoolTotal : "-",
      curTokenPoolTotal : "-",
      curPoolShare : "-",
      
      myCollectedEthFees : "",
      myCollectedTokenFees : "",

      curFactory : factory,
      providerFeePercent : 0.003,
    }

    // check for new modern dapp browsers
    if (window.ethereum) {
      // request access to account
      let enableRequest = async () => {
        try {
            await window.ethereum.enable();          
            
            this.retrieveData();
        } catch (error) {            
            console.log(error);

            this.retrieveData();
        }
      }

      enableRequest();      

      this.retrieveData();
    } else if (window.web3) {
      // legacy dapp browsers
      this.retrieveData();      
    } else {
      this.isWeb3 = false;
    }
}

retrieveData = () => {
  if (typeof web3 !== 'undefined') {
      this.web3Provider = window.web3.currentProvider;

      window.web3 = new Web3(window.web3.currentProvider);
      
      if (this.state.curFactory.length == 0) {
        return;
      }

      let address = Factory.tokens[this.state.curFactory].address;

      var tokenDecimals = Math.pow(10, Factory.tokens[this.state.curFactory].decimals);

      var contract = new window.web3.eth.Contract(TokenABI.abi, address);
      // let contractInstance = contractRef.at(address);

      // console.log(Uniswap.address);
      // console.log(events);
      // console.log(Web3.version);

      // get the user address
      window.web3.eth.getCoinbase().then((coinbase) => {
          if (coinbase === null) {
            coinbase = "Locked";
          }

          this.myAddress = coinbase;
          this.setState({ 
            myAddress : coinbase
          });      

        let options = {
          address: address,
          // fromBlock: (blockNumber - 150000),
          fromBlock : 6627944,
          // fromBlock : 0,
          // fromBlock: (blockNumber - 9000),
          toBlock: 'latest',
          // topics: [["0xcd60aa75dea3072fbc07ae6d7d856b5dc5f4eee88854f5b4abf7b680ef8bc50f",
          // "0x06239653922ac7bea6aa2b19dc486b9361821d37712eb796adfd38d81de278ca",
          // "0x7f4091b46c33e918a0f3aa42307641d17bb67029427a5369e54b353984238705"]]
          // "0x0fbf06c058b90cb038a618f8c2acbf6145f8b3570fd1fa56abb8f0f3f05b36e8"]]

        };

        // topics
        // 0xcd60aa75dea3072fbc07ae6d7d856b5dc5f4eee88854f5b4abf7b680ef8bc50f = TokenPurchase      
        // 0x06239653922ac7bea6aa2b19dc486b9361821d37712eb796adfd38d81de278ca = AddLiquidity
        // 0x7f4091b46c33e918a0f3aa42307641d17bb67029427a5369e54b353984238705 = EthPurchase
        // 0x0fbf06c058b90cb038a618f8c2acbf6145f8b3570fd1fa56abb8f0f3f05b36e8 = RemoveLiquidity 

        let that = this;

        var events = contract.getPastEvents("allEvents", options).then((events) => {
          console.log(events);

          let eventListTemp = [];

          let curEthTotal = 0;
          let curTokenTotal = 0;

          let curPoolShare = 0.0;
          let curPoolShareDisplay = 0.0;

          let numMyShareTokens = 0.0;
          let numMintedShareTokens = 0.0;

          let numMyDepositedEth = 0.0;
          let numMyDepositedTokens = 0.0;

          let lastEventObj;

          events.forEach((e) => {
            let eventType = e.event;

            let eventObj = {
              type : eventType,

              curPoolShare : 0.0,

              numEth : 0,
              numTokens : 0,
              
              tx : e.transactionHash,
              provider : e.returnValues.provider,
              block : e.blockNumber,

              liquidtyProviderFee : "-"
            }

            let eth, tokens;



            if (eventType === "AddLiquidity") {
              eth = e.returnValues[1] / 1e18;
              tokens = e.returnValues.token_amount / tokenDecimals;

              eventObj.type = "Add Liquidty";

              if (eventObj.provider.toUpperCase() == this.state.myAddress.toUpperCase()) {
                numMyDepositedEth += eth;
                numMyDepositedTokens += tokens;
              }
            } else if (eventType === "RemoveLiquidity") {
              eth = -e.returnValues.eth_amount / 1e18;
              tokens = -e.returnValues.token_amount / tokenDecimals;

              eventObj.type = "Remove Liquidty";

              if (eventObj.provider.toUpperCase() == this.state.myAddress.toUpperCase()) {
                numMyDepositedEth += eth;
                numMyDepositedTokens += tokens;
              }
            } else if (eventType === "TokenPurchase") {
              eth = e.returnValues.eth_sold / 1e18;
              tokens = -e.returnValues.tokens_bought / tokenDecimals;
              
              eventObj.provider = e.returnValues.buyer; 

              // calculate the eth fee that liquidity providers will receive
              eventObj.liquidtyProviderFee = (eth * this.state.providerFeePercent).toFixed(5) + " ETH";
            } else if (eventType === "EthPurchase") {
              eth = -e.returnValues.eth_bought / 1e18;
              tokens = e.returnValues.tokens_sold / tokenDecimals;

              eventObj.provider = e.returnValues.buyer; 

              // calculate the token fee that liquidity providers will receive
              eventObj.liquidtyProviderFee = (tokens * this.state.providerFeePercent).toFixed(5) + " " + this.state.curFactory;
            } else if (eventType == "Transfer") {
              // Track share tokens
              let sender = e.returnValues[0];
              let receiver = e.returnValues[1];
              let numShareTokens = e.returnValues[2] / 1e18;
                      
              // check if this was mint or burn share tokens        
              if (receiver === "0x0000000000000000000000000000000000000000") {
                // burn share tokens
                numMintedShareTokens -= numShareTokens;

                // check if the sender was user
                if (sender.toUpperCase() === this.myAddress.toUpperCase()) {
                    numMyShareTokens -= numShareTokens;
                }
              } else {
                // mint share tokens
                numMintedShareTokens += numShareTokens;

                if (receiver.toUpperCase() === this.myAddress.toUpperCase()) {
                    numMyShareTokens += numShareTokens;
                }
              }

              // update current pool share. take users's share tokens and divide by total minted share tokens
              curPoolShare = numMyShareTokens / numMintedShareTokens;
              
              if (numMintedShareTokens == 0) {
                curPoolShare = 0;
              }
        
              // get a percentage from the pool share
              curPoolShareDisplay = (curPoolShare * 100).toFixed(2);

              // if the user's pool share is 0, don't show a number
              if (curPoolShareDisplay == 0.0) {
                curPoolShareDisplay = "-";
              } else {
                curPoolShareDisplay = curPoolShareDisplay  + "%"; // add a percentage symbol
              }

              // set it on the last event object before this transfer
              lastEventObj.curPoolShare = curPoolShareDisplay;

              return;
            }

            // save a reference to the last event object (transfer events follow add/remove liquidity)
            lastEventObj = eventObj;

            // update the total pool eth total
            curEthTotal += eth;              

            // update the total pool token total
            curTokenTotal += tokens;

            // set the number of eth and tokens for this event
            eventObj.numEth = eth.toFixed(3);
            eventObj.numTokens = tokens.toFixed(3);

            // set the user's current pool share %
            eventObj.curPoolShare = curPoolShareDisplay;

            // push this event object onto the array
            eventListTemp.push(eventObj);

          });

          // reverse the list so the most recent events are first
          eventListTemp.reverse();

          // calculate how much fees we've accrued by determining how much eth/tokens we own minus what we've deposited/withdrawn
          let myEstimatedAccruedEthFees = curPoolShare * curEthTotal - numMyDepositedEth;
          let myEstimatedAccruedTokenFees = curPoolShare * curTokenTotal - numMyDepositedTokens;

          // if user doesn't have any pool share, then don't share how many fees they might've accumulated before the most recent LiquidityRemoval
          if (curPoolShare.toFixed(2) <= 0.0) {
            myEstimatedAccruedEthFees = 0;
            myEstimatedAccruedTokenFees = 0;
          }


          if (myEstimatedAccruedEthFees == 0) {
            myEstimatedAccruedEthFees = "";
          } else {
            myEstimatedAccruedEthFees = myEstimatedAccruedEthFees.toFixed(5) + " ETH";
          }
          
          if (myEstimatedAccruedTokenFees == 0) {
            myEstimatedAccruedTokenFees = "";
          } else {
            if (myEstimatedAccruedEthFees.length == 0) {
              myEstimatedAccruedTokenFees = myEstimatedAccruedTokenFees.toFixed(5) + " " + this.state.curFactory;
            } else {
              myEstimatedAccruedTokenFees = ", " + myEstimatedAccruedTokenFees.toFixed(5) + " " + this.state.curFactory;
            }              
          }

          // update our state
          that.setState({  
            eventList : eventListTemp,

            curEthPoolTotal : curEthTotal.toFixed(2),
            curTokenPoolTotal : curTokenTotal.toFixed(2),

            curPoolShare : curPoolShareDisplay,
            
            myCollectedEthFees : myEstimatedAccruedEthFees,
            myCollectedTokenFees : myEstimatedAccruedTokenFees
          });
        });
    });
  } else {
    this.isWeb3 = false;
  }
}

renderEvents() {
  if (typeof this.state.eventList === 'undefined') {
    return (
      <img className= "LoadingImage" src="./loading.gif"/>
      ) 
  }

  return (
   <EventTable eventList={this.state.eventList} curFactory={this.state.curFactory} myAddress={this.state.myAddress}/>
  );
}

renderCoinbase() {
  return (
    <table>
    <thead>
    <tr>
      <th>Address</th>
      <th>Pool Size (ETH)</th>
      <th>Pool Size ({this.state.curFactory})</th>
      <th>Pool Share</th>
      <th>Accrued Fees (Estimated)</th>
      </tr> 
    </thead>
    <tbody>
      <tr>
        <td><div className="truncate">{this.state.myAddress}</div></td>
        <td>{this.state.curEthPoolTotal}</td>
        <td>{this.state.curTokenPoolTotal}</td>
        <td>{this.state.curPoolShare}</td>
        <td>{this.state.myCollectedEthFees}{this.state.myCollectedTokenFees}</td>
      </tr>
    </tbody>
    </table>
  );
}

renderDropdown() {
  return (  
    <table className="factory-selector">
    <tbody> 
    <TokenSelectorRows activeFactory={this.state.curFactory}/>
    </tbody>
    </table>    
  );
}

renderAttribution() {
  return (
    <p className="attribution">Loading indicator from: <a href="https://www.behance.net/gallery/31234507/Open-source-Loading-GIF-Icons-Vol-1" target="_blank">@hassan_gde</a></p>
  )
}

render() {  
  if(this.isWeb3) {      
      return (        
      <div>
        {this.renderDropdown()}
        {this.renderCoinbase()}
        {this.renderEvents()}        
        {this.renderAttribution()}        
      </div>        
      ) 
  } else{  
    return(  
      <div className="InstallMetaMask">

        <div>
        <img src="./metamask-locked.png"/>
        <br/>
        <br/>
          <a href="https://metamask.io/">Get MetaMask</a>
          </div>
      </div>
    ) 
  }
}
} 

export default App; 