import React, { Component } from "react";

import ReactTable from "react-table";

import "./TokenPoolDetails.css";

class TokenPoolDetails extends Component {

  render() {
    var tokenLink =
      "https://www.etherscan.io/address/" + this.props.tokenAddress;
    var exchangeLink =
      "https://www.etherscan.io/address/" + this.props.exchangeAddress;

    var accruedFees = this.props.myCollectedEthFees + this.props.myCollectedTokenFees;

    if (accruedFees.length === 0) {
      accruedFees = "-";
    }

    var rateDisplay = (this.props.exchangeRate > 0) ? ("1 ETH = " + this.props.exchangeRate.toFixed(4)) : "-";

    const data = [
      {
        "symbol" : this.props.curExchange,
        "token" : this.props.tokenAddress,
        "exchange" : this.props.exchangeAddress,
        "poolSize" : this.props.curEthPoolTotal,
        "poolSizeToken" : this.props.curTokenPoolTotal,
        "poolShare" : this.props.curPoolShare,
        "accruedFees" : accruedFees,
        "rate" : rateDisplay
      }
    ];

    var headerTokenLiquidity = "Liquidity (" + this.props.curExchange + ")";

    const columns = [
      {
        Header: "Symbol",
        accessor: "symbol",
        Cell: row => (
          <b>{row.value}</b>            
        ),
        maxWidth : 100
      },
      {
        Header: "Token",
        accessor: "token",
        Cell: row => (
            <a href={tokenLink} rel="noopener noreferrer" target="_blank">
              <div className="truncate">{row.value}</div>
            </a>
        )
      },
      {
        Header: "Exchange",
        accessor: "exchange",
        Cell: row => (
          <div style={{
          padding: "2px"
        }}>
            <a href={exchangeLink} rel="noopener noreferrer" target="_blank">
              <div className="truncate">{row.value}</div>
            </a>
            </div>

        )
      },
      {
        Header: "Rate",
        accessor: "rate",
        className: "right"
      },
      {
        Header: "Liquidty (ETH)",
        accessor: "poolSize",
        className: "right"
      },
      {
        Header: headerTokenLiquidity,
        accessor: "poolSizeToken",
        className: "right"
      },
      {
        Header: "Your Share",
        accessor: "poolShare",
        className: "right"
      },
      {
        Header: "Your Fees",
        accessor: "accruedFees",
        className: "right"
      }
    ];

    return (
      <ReactTable
      className="TokenPoolDetails"
        data={data}
        minRows={1}
        showPagination={false}
        sortable={false}
        columns={columns}
        resizable={false}
      />
    );
  }
}

export default TokenPoolDetails;