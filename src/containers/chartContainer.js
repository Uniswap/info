import { Container } from "unstated";
import dayjs from "dayjs";

import { BASE_URL } from "../helpers";

export class ChartContainer extends Container {
  state = {
    data: []
  };

  resetChart = () => this.setState({ data: [] });

  async fetchChart(exchangeAddress, daysToQuery) {
    try {
      // current time
      const utcEndTime = dayjs();

      let utcStartTime;
      let unit;

      // go back, go way way back
      switch (daysToQuery) {
        case 365:
          utcStartTime = utcEndTime.subtract(1, "year").startOf("year");
          unit = "month";
          break;
        case 30:
          utcStartTime = utcEndTime.subtract(1, "month").startOf("month");
          unit = "day";
          break;
        case 7:
        default:
          utcStartTime = utcEndTime.subtract(7, "day").startOf("day");
          unit = "day";
          break;
      }

      const data = await fetch(
        `${BASE_URL}v1/chart?exchangeAddress=${exchangeAddress}&startTime=${utcStartTime.unix()}&endTime=${utcEndTime.unix()}&unit=${unit}`
      );

      if (!data.ok) {
        throw Error(data.status);
      }

      const json = await data.json();

      console.log(`fetched ${json.length} chart data for ${exchangeAddress}`);

      this.setState({
        data: json
      });
    } catch (err) {
      console.log("error: ", err);
    }
  }
}
