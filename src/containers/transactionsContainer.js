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

      // go back n days
      const utcStartTime = utcEndTime.subtract(daysToQuery, "day");

      const data = await fetch(
        `${BASE_URL}v1/history?exchangeAddress=${exchangeAddress}&startTime=${utcStartTime.unix()}&endTime=${utcEndTime.unix()}`
      );

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
