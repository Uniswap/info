import React, { Component } from 'react';

import {Bar} from 'react-chartjs-2';

import {BigNumber} from 'bignumber.js';

import TokenPoolDetails from './TokenPoolDetails/TokenPoolDetails.js';
import TokenPoolHistory from './TokenPoolHistory/TokenPoolHistory.js';

import Factory from './Factory.js'; 
import ExchangeABI from './ExchangeABI.js';

import Web3 from 'web3'  

import './App.css';

function TokenSelectorSingleRow(props) {
	var activeFactory = props.activeFactory;
	var tokensInRow = props.tokensInRow;

	var link = ""

	return (
		tokensInRow.map((token) => {
			var link = "?token=" + token;
			var isActiveFactory = (token === activeFactory);

			if (isActiveFactory) {
				return (
					<td key={token} className="token-selector-active"><div className="token-selector-active">{token}</div></td>
					)
			} else {
				return (
					<td key={token}><a href= {link}>{token}</a></td>
					)
			}
		})
		)
}


function TokenSelectorRows(props) {
	var tokenRows = [];

	tokenRows.push([]);

	var activeFactory = props.activeFactory;

	var tokensPerRow = 1;

	var tokenKeys = Object.keys(Factory.tokens);

	for (var i = 0; i < tokenKeys.length; i++) {
		if (tokenRows[tokenRows.length - 1].length === tokensPerRow) {
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

		class App extends React.Component {  
			constructor() {
				super(); 

				this.appName = 'Uniswap Events'; 
				this.isWeb3 = true;
				this.isWeb3Locked = false; //If metamask account is locked
				this.didReceiveData = false;


				var factory = Factory.initial;

    // check for URL Search Params support    
    if ('URLSearchParams' in window) {
      // extract factory token from URL if found
      var urlParams = new URLSearchParams(window.location.search);
      
      if (urlParams.has("token")) {
      	factory = urlParams.get("token");
      }
  }

  this.curFactory = factory;

  this.state = {
  	myAddress : "Locked",
  	tokenAddress : "",

  	curEthPoolTotal : "-",
  	curTokenPoolTotal : "-",
  	curPoolShare : "-",

  	myCollectedEthFees : "",
  	myCollectedTokenFees : "",

  	didRequestData : false,
  	didReceiveData : false,

  	curFactory : factory,
  	providerFeePercent : 0.003,

  	eventList : [],
  	volumeDataMap : {}
  };

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

      
  } else if (window.web3) {
      // legacy dapp browsers
      this.retrieveData();      
  } else {
  	this.isWeb3 = false;
  }
}

retrieveData = () => {
	if (this.didRequestData) {
		return;
	}

	if (typeof web3 !== 'undefined') {
		this.web3Provider = window.web3.currentProvider;

		window.web3 = new Web3(window.web3.currentProvider);

		console.log(this.state.curFactory);
		if (typeof this.state.curFactory === 'undefined') {
			return;
		}

		let exchangeAddress = Factory.tokens[this.state.curFactory].address;

      // get the token address
      var tokenDecimals = Math.pow(10, Factory.tokens[this.state.curFactory].decimals);

      var contract = new window.web3.eth.Contract(ExchangeABI.abi, exchangeAddress);

      let that = this;

      contract.methods.tokenAddress().call().then(function(tokenAddress) {      	
      	that.setState({ 
      		tokenAddress : tokenAddress
      	});
      });

      this.didRequestData = true;

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
      		address: exchangeAddress,
      		fromBlock : 6627944,
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

        var events = contract.getPastEvents("allEvents", options).then((events) => {
        	console.log(events);

        	let eventListTemp = [];

        	let curEthTotal = 0;
        	let curTokenTotal = 0;

        	let curPoolShare = 0.0;
        	let curPoolShareDisplay = 0.0;

        	let numMyShareTokens = new BigNumber(0);
        	let numMintedShareTokens = new BigNumber(0);

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

        			id : e.id,

        			tx : e.transactionHash,
        			provider : e.returnValues.provider,
        			block : e.blockNumber,

        			liquidtyProviderFee : "-",

              volume : 0 // how much swapping volume was in this event (set by purchase events only)
          }

          let eth, tokens;

          if (eventType === "AddLiquidity") {
          	eth = e.returnValues[1] / 1e18;
          	tokens = e.returnValues.token_amount / tokenDecimals;

          	eventObj.type = "Add Liquidty";

          	if (eventObj.provider.toUpperCase() === this.state.myAddress.toUpperCase()) {
          		numMyDepositedEth += eth;
          		numMyDepositedTokens += tokens;
          	}
          } else if (eventType === "RemoveLiquidity") {
          	eth = -e.returnValues.eth_amount / 1e18;
          	tokens = -e.returnValues.token_amount / tokenDecimals;

          	eventObj.type = "Remove Liquidty";

          	if (eventObj.provider.toUpperCase() === this.state.myAddress.toUpperCase()) {
          		numMyDepositedEth += eth;
          		numMyDepositedTokens += tokens;
          	}
          } else if (eventType === "TokenPurchase") {
          	eth = e.returnValues.eth_sold / 1e18;
          	tokens = -e.returnValues.tokens_bought / tokenDecimals;

          	eventObj.provider = e.returnValues.buyer; 
          	eventObj.type = "Token Purchase";

          	eventObj.volume = eth;

              // calculate the eth fee that liquidity providers will receive
              eventObj.liquidtyProviderFee = (eth * this.state.providerFeePercent).toFixed(4) + " ETH";
          } else if (eventType === "EthPurchase") {
          	eth = -e.returnValues.eth_bought / 1e18;
          	tokens = e.returnValues.tokens_sold / tokenDecimals;

          	eventObj.provider = e.returnValues.buyer; 
          	eventObj.type = "Eth Purchase";

          	eventObj.volume = -eth;

              // calculate the token fee that liquidity providers will receive
              eventObj.liquidtyProviderFee = (tokens * this.state.providerFeePercent).toFixed(4) + " " + this.state.curFactory;
          } else if (eventType === "Transfer") {
              // Track share tokens
              let sender = e.returnValues[0];
              let receiver = e.returnValues[1];              
              let numShareTokens = new BigNumber(e.returnValues[2]);// / 1e18;
              
              // check if this was mint or burn share tokens        
              if (receiver === "0x0000000000000000000000000000000000000000") {
                // burn share tokens
                numMintedShareTokens = numMintedShareTokens.minus(numShareTokens);

                // check if the sender was user
                if (sender.toUpperCase() === this.myAddress.toUpperCase()) {
                	numMyShareTokens = numMyShareTokens.minus(numShareTokens);
                }
            } else {
                // mint share tokens
                numMintedShareTokens = numMintedShareTokens.plus(numShareTokens);

                if (receiver.toUpperCase() === this.myAddress.toUpperCase()) {
                	numMyShareTokens = numMyShareTokens.plus(numShareTokens);
                }
            }

              // update current pool share. take users's share tokens and divide by total minted share tokens
              curPoolShare = numMyShareTokens.dividedBy(numMintedShareTokens);
              
              if (curPoolShare.toFixed(4) == 0) {
              	curPoolShare = 0;
              	numMyDepositedEth = 0;
              	numMyDepositedTokens = 0;
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
            eventObj.numEth = eth.toFixed(4);
            eventObj.numTokens = tokens.toFixed(4);

            // set the user's current pool share %
            eventObj.curPoolShare = curPoolShareDisplay;

            // push this event object onto the array
            eventListTemp.push(eventObj);

        });

          // reverse the list so the most recent events are first
          eventListTemp.reverse();

          // calculate how much fees we've accrued by determining how much eth/tokens we own minus what we've deposited/withdrawn
          let myEstimatedAccruedEthFees = (curPoolShare * curEthTotal - numMyDepositedEth).toFixed(2);
          let myEstimatedAccruedTokenFees = (curPoolShare * curTokenTotal - numMyDepositedTokens).toFixed(2);

          if (myEstimatedAccruedEthFees == 0) {
          	myEstimatedAccruedEthFees = "";
          } else {
          	myEstimatedAccruedEthFees = myEstimatedAccruedEthFees + " ETH";
          }
          
          if (myEstimatedAccruedTokenFees == 0) {
          	myEstimatedAccruedTokenFees = "";
          } else {
          	if (myEstimatedAccruedEthFees.length == 0) {
          		myEstimatedAccruedTokenFees = myEstimatedAccruedTokenFees + " " + this.state.curFactory;
          	} else {
          		myEstimatedAccruedTokenFees = ", " + myEstimatedAccruedTokenFees + " " + this.state.curFactory;
          	}              
          }
          this.didReceiveData = true;

          // update our state
          that.setState({  
          	eventList : eventListTemp,

          	curEthPoolTotal : curEthTotal.toFixed(4),
          	curTokenPoolTotal : curTokenTotal.toFixed(4),

          	curPoolShare : curPoolShareDisplay,

          	myCollectedEthFees : myEstimatedAccruedEthFees,
          	myCollectedTokenFees : myEstimatedAccruedTokenFees
          });

          if (eventListTemp.length > 0) {
          	var recentEvent = eventListTemp[0];
          	var oldestEvent = eventListTemp[eventListTemp.length - 1];
          	var dateKeyToVolumeMap = {};

	          // get the timestamp for the most recent block
	          window.web3.eth.getBlock(recentEvent.block).then(function(recentBlock) {
	          	var mostRecentBlockTimestamp = recentBlock.timestamp;
	          	var mostRecentBlockNum = recentBlock.number;

				// get the timestamp for the oldest block
				window.web3.eth.getBlock(oldestEvent.block).then(function(oldestBlock) {
					var oldestBlockTimestamp = oldestBlock.timestamp;
					var oldestBlockNum = oldestBlock.number;

					var blockBounds = mostRecentBlockNum - oldestBlockNum;
					var timestampBoundsInSeconds = mostRecentBlockTimestamp - oldestBlockTimestamp;

		  			// now we have our bounds. determine a timestamp for each of the block numbers in the event list
		  			that.state.eventList.forEach((e) => {
		  				var blockRatio = (e.block - oldestBlockNum) / blockBounds;
		  				var blockTimestampInSeconds = blockRatio * timestampBoundsInSeconds + oldestBlockTimestamp;

		  				// calculate which date time this block number falls under
		  				var blockDay = new Date(blockTimestampInSeconds * 1000);

		  				var dateKey = blockDay.getMonth() + "-" + blockDay.getDate() + "-" + blockDay.getFullYear();

		  				console.log(e.block + "  " + oldestBlockNum  + "  " + dateKey + "  " + e.volume);//+ "  "  + mostRecentBlockNum + "   " + blockRatio + "  " + dateKey);

		  				if (e.volume > 0) {
		  					if (!(dateKey in dateKeyToVolumeMap)) {
		  						dateKeyToVolumeMap[dateKey] = 0;
		  					}

		  					dateKeyToVolumeMap[dateKey] += e.volume;
		  				}
		  			});

		  			that.setState({
		  				volumeDataMap : dateKeyToVolumeMap,
		  				didReceiveData : true
		  			});
		  		});
			});
	      } else {
	      	that.setState({
	      		didReceiveData : true
	      	});
	      }
	  });
});
} else {
	this.isWeb3 = false;
}
}

renderTokenPoolHistory() {	
	if (this.didReceiveData == false) {
		return (
			<img className= "LoadingImage" src="./loading.gif"/>
			) 
	}

	return (
		<TokenPoolHistory eventList={this.state.eventList} curFactory={this.state.curFactory} myAddress={this.state.myAddress}/>
		);
}

renderTokenPoolDetails() {
	if (this.curFactory.length == 0) {
		return (
			<div/>
			)
	}	

	var exchange = Factory.tokens[this.state.curFactory].address;

	return (
		<TokenPoolDetails 
		curFactory = {this.state.curFactory} 
		tokenAddress = {this.state.tokenAddress}
		curEthPoolTotal = {this.state.curEthPoolTotal}
		curTokenPoolTotal = {this.state.curTokenPoolTotal}
		curPoolShare = {this.state.curPoolShare}
		myCollectedEthFees = {this.state.myCollectedEthFees}
		myCollectedTokenFees = {this.state.myCollectedTokenFees}
		exchangeAddress = {exchange}
		/>    
		);
}

renderVolumeChart() {
	// don't render anything if we haven't loaded the events yet
	if (this.didReceiveData == false) {
		return (
			<div/>
			) 
	}

	var labels = [];
	var volumeData = [];

		var monthNames = [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
		];

	  	// calculate dataset
	  	var daysToShow = 90;

	  	var oneDayOffset = (24 * 60 * 60 * 1000);

	  	for (var daysBack = (daysToShow - 1); daysBack >= 0; daysBack--) {
	  		var date = new Date(Date.now() - oneDayOffset * daysBack);
	  		// console.log(date);

	  		labels.push(monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear());

	  		var dateKey = date.getMonth() + "-" + date.getDate() + "-" + date.getFullYear();

	  		if (dateKey in this.state.volumeDataMap) {
	  			volumeData.push(this.state.volumeDataMap[dateKey].toFixed(4));
	  		} else {
	  			volumeData.push(0);
	  		}
	  	}

	  var data = {
	  	labels: labels,
	  	datasets: [
	  	{
	  		label: 'Swap Volume (ETH)',
	  		backgroundColor: 'rgba(160,160,160,0.2)',

	  		borderWidth: 0,
	  		hoverBackgroundColor: 'rgba(102,153,203,1)',
	  		hoverBorderWidth: 0,
	  		data: volumeData
	  	}
	  	]
	  };

	  return (
	  	<div className="volumeChart">
	  	<Bar 
	  	data={data} 
	  	height={250}
	  	options={
	  		{
	  			maintainAspectRatio: false
	  		}
	  	}
	  	/>
	  	</div>
	  	)
	  }

	  renderTokenSelector() {
	  	return (
	  	<table className="token-selector">
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
	  		<div className="sidenav">
	  		{this.renderTokenSelector()}
	  		</div>
	  		<div className="main-content">
	  		{this.renderTokenPoolDetails()}
	  		{this.renderVolumeChart()}
	  		{this.renderTokenPoolHistory()}        
	  		{this.renderAttribution()}        
	  		</div>
	  		</div>        
	  		) 
	  	} else{  
	  		return(  
	  		<div className="InstallMetaMask">

	  		<div>
	  		<img src="./metamask-locked.png"/>
	  		<br/>
	  		<br/>
	  		<a href="https://metamask.io/" target="_blank">Get MetaMask</a>

	  		<p className="InstallMetaMaskText">or</p>

	  		<a href="https://brave.com" target="_blank">Switch to Brave</a>
	  		</div>
	  		</div>
	  		) 
	  	}
	  }
	} 

	export default App; 