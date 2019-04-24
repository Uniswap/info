import { Container } from "unstated";
import dayjs from "dayjs";

import { BASE_URL } from "../helpers";

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

      const data = await fetch(
        `${BASE_URL}v1/history?exchangeAddress=${exchangeAddress}&startTime=${utcStartTime.unix()}&endTime=${utcEndTime.unix()}`
      );

      if (!data.ok) {
        throw Error(data.status);
      }

      const json = await data.json();

      console.log(`fetched ${json.length} tx for ${exchangeAddress}`);

      this.setState({
        transactions: json
      });
    } catch (err) {
      console.log("error: ", err);
    }
  }
}
