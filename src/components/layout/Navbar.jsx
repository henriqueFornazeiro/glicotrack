import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const links = [
  { to: '/', label: 'Registrar', icon: '📝', roles: ['paciente'] },
  { to: '/historico', label: 'Histórico', icon: '📊', roles: ['paciente', 'familiar'] },
  { to: '/configuracoes', label: 'Configurações', icon: '⚙️', roles: ['paciente'] },
]

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  const linksVisiveis = links.filter(l => l.roles.includes(profile?.role ?? 'paciente'))

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🩸</span>
            <span className="font-bold text-slate-800">GlicoTrack</span>
          </div>

          {/* Links desktop */}
          <div className="hidden sm:flex items-center gap-1">
            {linksVisiveis.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          {/* Usuário + logout desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm text-slate-500">{profile?.nome}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              Sair
            </button>
          </div>

          {/* Menu hamburguer mobile */}
          <button
            className="sm:hidden p-2 text-slate-600"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {menuAberto ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-1">
          {linksVisiveis.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuAberto(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <div className="border-t border-slate-100 pt-2 mt-2 flex items-center justify-between">
            <span className="text-sm text-slate-500">{profile?.nome}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-red-600 font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
