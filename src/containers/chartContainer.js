import { Container } from "unstated";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { BASE_URL } from "../helpers";

dayjs.extend(utc);

export class ChartContainer extends Container {
  state = {
    data: []
  };

  resetChart = () => this.setState({ data: [] });

  async fetchChart(exchangeAddress, daysToQuery) {
    try {
      // current time
      const utcEndTime = dayjs.utc();

      let utcStartTime;
      let unit;

      // go back, go way way back
      switch (daysToQuery) {
        case "all":
          utcStartTime = utcEndTime.subtract(1, "year").startOf("year");
          unit = "month";
          break;
        case "3month":
          utcStartTime = utcEndTime.subtract(3, "month").startOf("month");
          unit = "day";
          break;
        case "1month":
          utcStartTime = utcEndTime.subtract(1, "month").startOf("month");
          unit = "day";
          break;
        case "1week":
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
