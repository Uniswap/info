import AccountController from './controllers/AccountController'
import GlobalController from './controllers/GlobalController'
import PairController from './controllers/PairController'
import TokenController from './controllers/TokenController'

const pairApi = new PairController()
const accountApi = new AccountController()
const tokenApi = new TokenController()
const globalApi = new GlobalController()

export { pairApi, accountApi, tokenApi, globalApi }
