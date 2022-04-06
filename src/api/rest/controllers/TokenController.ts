import ApiBase from '../core/ApiBase'

class TokenController extends ApiBase {
  public getAmlConditions() {
    return this.get('')
  }
}

export default new TokenController()
