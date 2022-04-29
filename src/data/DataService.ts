import { getCurrentNetwork } from 'utils'
import EthAccountDataController from './ethereum/AccountDataController'
import EthGlobalDataController from './ethereum/GlobalDataController'
import EthPairDataController from './ethereum/PairDataController'
import EthTokenDataController from './ethereum/TokenDataController'
import EthTransactionDataController from './ethereum/TransactionDataController'

import TrxAccountDataController from './tron/AccountDataController'
import TrxGlobalDataController from './tron/GlobalDataController'
import TrxPairDataController from './tron/PairDataController'
import TrxTokenDataController from './tron/TokenDataController'
import TrxTransactionDataController from './tron/TransactionDataController'

import { SupportedNetwork } from 'constants/networks'
import { IAccountDataController } from './types/AccountController.interface'
import { IGlobalDataController } from './types/GlobalController.interface'
import { IPairDataController } from './types/PairController.interface'
import { ITokenDataController } from './types/TokenController.interface'
import { ITransactionDataController } from './types/TransactionController.interface'

class DataService {
  public tokens!: ITokenDataController
  public pairs!: IPairDataController
  public transactions!: ITransactionDataController
  public accounts!: IAccountDataController
  public global!: IGlobalDataController

  constructor() {
    this.initDataControllers(getCurrentNetwork().id)
  }

  public initDataControllers(activeNetwork: SupportedNetwork) {
    switch (activeNetwork) {
      case SupportedNetwork.ETHEREUM: {
        this.tokens = new EthTokenDataController()
        this.accounts = new EthAccountDataController()
        this.transactions = new EthTransactionDataController()
        this.global = new EthGlobalDataController()
        this.pairs = new EthPairDataController()
        break
      }
      case SupportedNetwork.TRON:
      default: {
        this.tokens = new TrxTokenDataController()
        this.accounts = new TrxAccountDataController()
        this.transactions = new TrxTransactionDataController()
        this.global = new TrxGlobalDataController()
        this.pairs = new TrxPairDataController()
        break
      }
    }
  }
}

export default new DataService()
