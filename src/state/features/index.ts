import userReducer from './user/slice'
import applicationReducer from './application/slice'
import globalReducer from './global/slice'
import pairsReducer from './pairs/slice'
import accountReducer from './account/slice'
import { combineReducers } from '@reduxjs/toolkit'

const rootReducer = combineReducers({
  user: userReducer,
  application: applicationReducer,
  global: globalReducer,
  pairs: pairsReducer,
  account: accountReducer
})

export default rootReducer
