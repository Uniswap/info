import { Container } from "unstated";

import { BASE_URL, Big } from "../helpers";

export class PoolContainer extends Container {
  state = {
    userNumPoolTokens: 0,
    userPoolPercent: 0
  };

  async fetchUser(exchangeAddress, userAccount) {
    try {
      const data = await fetch(
        `${BASE_URL}v1/user?exchangeAddress=${exchangeAddress}&userAddress=${userAccount}`
      );

      const json = await data.json();

      console.log(`fetched ${userAccount}'s pool share for ${exchangeAddress}`);

      this.setState({
        userNumPoolTokens: Big(json.userNumPoolTokens).toFixed(4),
        userPoolPercent: (json.userPoolPercent * 100).toFixed(2)
      });
    } catch (err) {
      console.log("error: ", err);
    }
  }
}
