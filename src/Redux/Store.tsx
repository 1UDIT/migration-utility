import { configureStore } from '@reduxjs/toolkit'
import TableDropDown from './tableDropFilter'

export const store = configureStore({
  reducer: {
    tableDownClick: TableDropDown
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // disable the warning
    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch