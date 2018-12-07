import React, { Component } from 'react';
import './TokenPoolHistory.css';

function GetTime(block) {
  return (
    "-" // TODO
  )
}

function EventTableBody(props) {
  let eventList = props.eventList;

  return eventList.map(e => {
    return (
      EventRow(e, props.myAddress)
    )
  });
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
    <tr key={e.id} className={rowClassName}>
      <td>{e.type}</td>
      <td><a href={txLink} target="_blank"><div className="truncate">{e.tx}</div></a></td>
      <td><a href={blockLink} target="_blank">{e.block}</a></td>
      <td>{GetTime(e.block)}</td>
      <td><a href={providerLink} target="_blank"><div className="truncate">{e.provider}</div></a></td>      
      <td>{e.numEth}</td>
      <td>{e.numTokens}</td>
      <td>{e.liquidtyProviderFee}</td>
      <td>{e.curPoolShare}</td>      
    </tr>
  );
}

class TokenPoolHistory extends React.Component {  
  constructor(props) {
    super(props); 
  }

  render () {
    var eventList = this.props.eventList;

    if (this.props.didReceiveData == false) {
      return (
        <img className= "LoadingImage" src="./loading3.gif"/>
      ) 
    }

    return (
      <table className="TokenPoolHistory">
      <thead>
      <tr>
      <th>Event</th>
      <th>Tx</th>
      <th>Block</th>
      <th>Time</th>
      <th>Address</th>      
      <th>Pool Adjustment (ETH)</th>
      <th>Pool Adjustment ({this.props.curFactory})</th>
      <th>Provider Fee</th>
      <th>Pool Share</th>      
      </tr>
      </thead>
       <tbody>
        {EventTableBody(this.props)}
      </tbody>
      </table>
      )
  }
}

export default TokenPoolHistory;