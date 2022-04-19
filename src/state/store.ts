import { configureStore } from '@reduxjs/toolkit'
import rootReducer from 'state/features'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const PERSISTED_KEYS: string[] = ['user']

const persistConfig = {
  key: 'root',
  storage,
  whitelist: PERSISTED_KEYS
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})
export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
