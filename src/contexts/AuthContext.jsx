import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

async function vincularConvitePendente(userId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return

  const { data: convite } = await supabase
    .from('family_access')
    .select('*')
    .eq('email_convidado', user.email)
    .eq('status', 'pendente')
    .limit(1)
    .single()

  if (!convite) return

  await supabase
    .from('family_access')
    .update({ familiar_id: userId, status: 'aceito' })
    .eq('id', convite.id)

  await supabase
    .from('profiles')
    .update({ role: 'familiar' })
    .eq('id', userId)
}

async function carregarProfile(userId, setProfile, setLoading) {
  const { data: perfil } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (perfil) {
    await vincularConvitePendente(userId)

    const { data: perfilAtualizado } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setProfile(perfilAtualizado)
  }

  setLoading(false)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) carregarProfile(session.user.id, setProfile, setLoading)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) carregarProfile(session.user.id, setProfile, setLoading)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email, password, nome) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome } },
    })
    return { error }
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
