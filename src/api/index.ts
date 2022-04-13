import AccountController from './controllers/AccountController'
import PairController from './controllers/PairController'

const pairApi = new PairController()
const accountApi = new AccountController()

export { pairApi, accountApi }
