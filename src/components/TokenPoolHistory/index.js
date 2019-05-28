/**
 * @prettier
 */

import React, { Component } from "react";
import ReactTable from "react-table";

import Loader from "../Loader";

import "./TokenPoolHistory.css";

// function GetTime(block) {
// return "-"; // TODO
// }

class TokenPoolHistory extends Component {
  render() {
    if (this.props.didReceiveData === false) {
      return <Loader 
        blockNum={this.props.loadingUpToBlockNum}
        maxBlockNum={this.props.maxBlockNum}
      />;
    }

    const data = [];

    this.props.eventList.forEach(e => {
      var txLink = "https://etherscan.io/tx/" + e.tx;
      var blockLink = "https://etherscan.io/block/" + e.block;
      var providerLink = "https://etherscan.io/address/" + e.provider;

      var event = {
        event: e.type,

        tx: e.tx,
        txLink: txLink,

        block: Number(e.block),
        blockLink: blockLink,

        time: "-",

        address: e.provider,
        addressLink: providerLink,

        poolAdjustmentEth: Number(e.numEth).toFixed(4),
        poolAdjustmentToken: Number(e.numTokens).toFixed(4),
        providerFee: e.liquidtyProviderFee,
        poolShare: e.curPoolShare
      };
      data.push(event);
    });

    var poolAdjustmentTokenHeader = this.props.curSymbol;

    const columns = [
      {
        Header: "Event",
        accessor: "event"
      },
      {
        Header: "Tx",
        accessor: "tx",
        Cell: row => (
          <div
            style={{
              padding: "5px"
            }}
          >
            <a
              href={row.original.txLink}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="truncate">{row.value}</div>
            </a>
          </div>
        )
      },
      {
        Header: "Block",
        accessor: "block",
        Cell: row => (
          <div
            style={{
              padding: "5px"
            }}
          >
            <a
              href={row.original.blockLink}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="truncate">{row.value}</div>
            </a>
          </div>
        )
      },
      {
        Header: "Address",
        accessor: "address",
        Cell: row => (
          <div
            style={{
              padding: "5px"
            }}
          >
            <a
              href={row.original.addressLink}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="truncate">{row.value}</div>
            </a>
          </div>
        )
      },
      {
        Header: "ETH",
        accessor: "poolAdjustmentEth",
        className: "right"
      },
      {
        Header: poolAdjustmentTokenHeader,
        accessor: "poolAdjustmentToken",
        className: "right"
      },
      {
        Header: "Provider Fee",
        accessor: "providerFee",
        className: "right"
      },
      {
        Header: "Pool Share",
        accessor: "poolShare",
        className: "right"
      }
    ];

    return (
      <ReactTable
        className="TokenPoolHistory -striped"
        data={data}
        columns={columns}
        showPageSizeOptions={false}
        defaultPageSize={10}
        minRows={10}
        resizable={false}
      />
    );
  }
}

export default TokenPoolHistory;
