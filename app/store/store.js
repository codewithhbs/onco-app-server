import { configureStore, createAction } from '@reduxjs/toolkit'
import CategReducer from './slice/Categorey/categorey.slice'
import login from './slice/auth/login.slice.js'
import User from './slice/auth/user.slice.js'
import CartReducer from './slice/Cart/CartSlice.js'
export const resetStore = createAction('resetStore');
const store = configureStore({
    reducer: {
        categorey: CategReducer,
        login: login,
        userData: User,
        cart: CartReducer
    }

})

export default store