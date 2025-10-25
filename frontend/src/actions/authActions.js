import authService from '../services/authService'

export const loginStart = () => ({
  type: 'auth/login_start'
})

export const loginSuccess = (user) => ({
  type: 'auth/login_success',
  user
})

export const loginFailure = (error) => ({
  type: 'auth/login_failure',
  error
})

export const logout = () => ({
  type: 'auth/logout'
})

export const setUser = (user) => ({
  type: 'auth/set_user',
  user
})

// Async action creators
export const loginUser = (email, password) => {
  return async (dispatch) => {
    dispatch(loginStart())
    try {
      const response = await authService.login(email, password)
      if (response.success) {
        dispatch(loginSuccess(response.data.user))
        return { success: true }
      } else {
        dispatch(loginFailure(response.message || 'Login failed'))
        return { success: false, error: response.message }
      }
    } catch (error) {
      dispatch(loginFailure(error.message))
      return { success: false, error: error.message }
    }
  }
}

export const registerUser = (userData) => {
  return async (dispatch) => {
    dispatch(loginStart())
    try {
      const response = await authService.register(userData)
      if (response.success) {
        dispatch(loginSuccess(response.data.user))
        return { success: true }
      } else {
        dispatch(loginFailure(response.message || 'Registration failed'))
        return { success: false, error: response.message }
      }
    } catch (error) {
      dispatch(loginFailure(error.message))
      return { success: false, error: error.message }
    }
  }
}

export const logoutUser = () => {
  return async (dispatch) => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch(logout())
    }
  }
}

export const checkAuth = () => {
  return async (dispatch) => {
    if (authService.isAuthenticated()) {
      try {
        const response = await authService.getCurrentUser()
        if (response.success) {
          dispatch(setUser(response.data.user))
        } else {
          dispatch(logout())
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        dispatch(logout())
      }
    }
  }
}
