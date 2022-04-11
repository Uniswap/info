import userReducer from './user/slice'
import applicationReducer from './application/slice'
import { combineReducers } from '@reduxjs/toolkit'

const rootReducer = combineReducers({
  user: userReducer,
  application: applicationReducer
})

export default rootReducer
