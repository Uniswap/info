import React, { Component } from 'react';
import './TokenPoolDetails.css';

class TokenPoolDetails extends React.Component {  
  constructor(props) {
    super(props); 
  }

  render () {
    var tokenLink = "https://www.etherscan.io/address/" + this.props.tokenAddress;
    var exchangeLink = "https://www.etherscan.io/address/" + this.props.exchangeAddress;

    return (
      <table className="TokenPoolDetails">
      <thead>
      <tr>
        <th>Symbol</th>
        <th>Token</th>
        <th>Exchange</th>
        <th>Pool Size (ETH)</th>
        <th>Pool Size ({this.props.curFactory})</th>
        <th>Pool Share</th>
        <th>Accrued Fees (Estimated)</th>
        </tr> 
      </thead>
      <tbody>
        <tr>
          <td>{this.props.curFactory}</td> 
          <td><a href={tokenLink} target="_blank"><div className="truncate">{this.props.tokenAddress}</div></a></td>
          <td><a href={exchangeLink} target="_blank"><div className="truncate">{this.props.exchangeAddress}</div></a></td>
          <td>{this.props.curEthPoolTotal}</td> 
          <td>{this.props.curTokenPoolTotal}</td> 
          <td>{this.props.curPoolShare}</td>
          <td>{this.props.myCollectedEthFees}{this.props.myCollectedTokenFees}</td> 
        </tr>
      </tbody>      
      </table>
      )
  }
}

export default TokenPoolDetails;