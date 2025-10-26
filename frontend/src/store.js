import { legacy_createStore as createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import authService from './services/authService'

const initialState = {
  sidebarShow: true,
  theme: 'light',
  auth: {
    isAuthenticated: authService.isAuthenticated(),
    user: null,
    loading: false,
    error: null,
  },
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    case 'auth/login_start':
      return {
        ...state,
        auth: { ...state.auth, loading: true, error: null }
      }
    case 'auth/login_success':
      return {
        ...state,
        auth: {
          ...state.auth,
          isAuthenticated: true,
          user: rest.user,
          loading: false,
          error: null
        }
      }
    case 'auth/login_failure':
      return {
        ...state,
        auth: {
          ...state.auth,
          isAuthenticated: false,
          user: null,
          loading: false,
          error: rest.error
        }
      }
    case 'auth/logout':
      return {
        ...state,
        auth: {
          ...state.auth,
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null
        }
      }
    case 'auth/set_user':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: rest.user,
          isAuthenticated: true
        }
      }
    default:
      return state
  }
}

const store = createStore(changeState, applyMiddleware(thunk))
export default store
