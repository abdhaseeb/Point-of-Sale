import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('pos_token'))

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token)
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser(decoded)
      } else {
        logout()
      }
    }
  }, [token])

  function login(tokenStr) {
    localStorage.setItem('pos_token', tokenStr)
    setToken(tokenStr)
    const decoded = parseJwt(tokenStr)
    setUser(decoded)
  }

  function logout() {
    localStorage.removeItem('pos_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
