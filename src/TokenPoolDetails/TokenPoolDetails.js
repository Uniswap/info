import React, { Component } from "react";

import ReactTable from "react-table";

import "./TokenPoolDetails.css";

class TokenPoolDetails extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var tokenLink =
      "https://www.etherscan.io/address/" + this.props.tokenAddress;
    var exchangeLink =
      "https://www.etherscan.io/address/" + this.props.exchangeAddress;

    var accruedFees = this.props.myCollectedEthFees + this.props.myCollectedTokenFees;

    if (accruedFees.length == 0) {
      accruedFees = "-";
    }

    const data = [
      {
        "symbol" : this.props.curFactory,
        "token" : this.props.tokenAddress,
        "exchange" : this.props.exchangeAddress,
        "poolSize" : this.props.curEthPoolTotal,
        "poolSizeToken" : this.props.curTokenPoolTotal,
        "poolShare" : this.props.curPoolShare,
        "accruedFees" : accruedFees,
        "rate" : "-"
      }
    ];

    var headerTokenLiquidity = "Liquidity (" + this.props.curFactory + ")";

    const columns = [
      {
        Header: "Symbol",
        accessor: "symbol",
        Cell: row => (
          <b>{row.value}</b>            
        )
      },
      {
        Header: "Token",
        accessor: "token",
        Cell: row => (
            <a href={tokenLink} target="_blank">
              <div className="truncate">{row.value}</div>
            </a>
        )
      },
      {
        Header: "Exchange",
        accessor: "exchange",
        Cell: row => (
          <div style={{
          padding: "5px"
        }}>
            <a href={exchangeLink} target="_blank">
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
        Header: "Pool Share",
        accessor: "poolShare",
        className: "right"
      },
      {
        Header: "Accrued Fees",
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