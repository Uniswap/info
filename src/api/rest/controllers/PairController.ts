import ApiBase from '../core/ApiBase'

class PairController extends ApiBase {
  public getAmlConditions() {
    return this.get('')
  }
}

export default new PairController()
