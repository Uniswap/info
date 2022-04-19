import userReducer from './user/slice'
import applicationReducer from './application/slice'
import globalReducer from './global/slice'
import { combineReducers } from '@reduxjs/toolkit'

const rootReducer = combineReducers({
  user: userReducer,
  application: applicationReducer,
  global: globalReducer
})

export default rootReducer
