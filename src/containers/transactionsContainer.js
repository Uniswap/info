import { Container } from "unstated";
import dayjs from "dayjs";

import { BASE_URL } from "../helpers";

import { client } from "../apollo/client"
import { TRANSACTIONS_QUERY } from '../apollo/queries'

export class TransactionsContainer extends Container {
  state = {
    transactions: []
  };

  resetTransactions = () => this.setState({ transactions: [] });

  async fetchTransactions(exchangeAddress, daysToQuery) {
    try {
      // current time
      const utcEndTime = dayjs();

      let utcStartTime;

      // go back n days
      switch (daysToQuery) {
        case "1week":
          utcStartTime = utcEndTime.subtract(7, "day");
          break;
      
        case "1month":
          utcStartTime = utcEndTime.subtract(1, "month");
          break;

        case "3months":
          utcStartTime = utcEndTime.subtract(3, "month");
          break;
        
        case "all":
          utcStartTime = utcEndTime.subtract(1, "year");
          break;
          
        default:
          utcStartTime = utcEndTime.subtract(7, "day");
          break;
      }

      // const data = await fetch(
      //   `${BASE_URL}v1/history?exchangeAddress=${exchangeAddress}&startTime=${utcStartTime.unix()}&endTime=${utcEndTime.unix()}`
      // );
      // console.log(`${BASE_URL}v1/history?exchangeAddress=${exchangeAddress}&startTime=${utcStartTime.unix()}&endTime=${utcEndTime.unix()}`)

      const result = await client.query({
        query: TRANSACTIONS_QUERY,
        fetchPolicy: 'network-only',

      })
      let data
      if (result){
        data = result.data
        console.log(`fetched ${data.transactions.length} tx for ${exchangeAddress}`);
        console.log(data)
        this.setState({
          transactions: data.transactions
        });
      }


    } catch (err) {
      console.log("error: ", err);
    }
  }
}
