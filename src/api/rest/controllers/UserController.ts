import ApiBase from '../core/ApiBase'

class UserController extends ApiBase {
  public getAmlConditions() {
    return this.get('')
  }
}

export default new UserController()
