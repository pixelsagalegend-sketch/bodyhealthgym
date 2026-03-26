import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

const DEMO_EMAIL = 'admin@demo.com'
const DEMO_PASSWORD = 'demo1234'
const DEMO_USER = { email: DEMO_EMAIL, id: 'demo', isDemo: true }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore demo session from sessionStorage
    const demoSession = sessionStorage.getItem('demo_session')
    if (demoSession === 'true') {
      setUser(DEMO_USER)
      setIsDemo(true)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setUser(DEMO_USER)
      setIsDemo(true)
      sessionStorage.setItem('demo_session', 'true')
      return { data: DEMO_USER, error: null }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    if (isDemo) {
      setUser(null)
      setIsDemo(false)
      sessionStorage.removeItem('demo_session')
      return { error: null }
    }
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
