import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User } from '../types'
import api from '../lib/api'

interface Ctx { user:User|null; login:(e:string,p:string)=>Promise<void>; register:(n:string,e:string,p:string)=>Promise<void>; logout:()=>void; refresh:()=>Promise<void>; loading:boolean }
const AuthCtx = createContext<Ctx|null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User|null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = async () => {
    try { const { data } = await api.get('auth/me'); setUser(data); localStorage.setItem('ss_user', JSON.stringify(data)) }
    catch { logout() }
  }
  useEffect(() => {
    const s = localStorage.getItem('ss_user'), t = localStorage.getItem('ss_token')
    if (s && t) setUser(JSON.parse(s))
    setLoading(false)
  }, [])
  const login = async (email: string, password: string) => {
    const { data } = await api.post('auth/login', { email, password })
    if (data.user.role !== 'admin') throw new Error('This portal is for admins/coordinators only')
    localStorage.setItem('ss_token', data.access_token)
    localStorage.setItem('ss_user', JSON.stringify(data.user))
    setUser(data.user)
  }
  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post('auth/register', { name, email, password, role: 'admin' })
    localStorage.setItem('ss_token', data.access_token)
    localStorage.setItem('ss_user', JSON.stringify(data.user))
    setUser(data.user)
  }
  const logout = () => { localStorage.removeItem('ss_token'); localStorage.removeItem('ss_user'); setUser(null) }
  return <AuthCtx.Provider value={{ user, login, register, logout, refresh, loading }}>{children}</AuthCtx.Provider>
}
export const useAuth = () => { const c = useContext(AuthCtx); if (!c) throw new Error(''); return c }
