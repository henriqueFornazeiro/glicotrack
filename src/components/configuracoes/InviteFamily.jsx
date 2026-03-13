import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function InviteFamily() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [convites, setConvites] = useState([])
  const [mensagem, setMensagem] = useState(null)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    fetchConvites()
  }, [user.id])

  async function fetchConvites() {
    const { data } = await supabase
      .from('family_access')
      .select('*')
      .eq('paciente_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setConvites(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setCarregando(true)
    setMensagem(null)
    const { error } = await supabase.from('family_access').insert({
      paciente_id: user.id,
      email_convidado: email,
      status: 'pendente',
    })
    setCarregando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao enviar convite. Verifique se o email já foi convidado.' })
    } else {
      setMensagem({ tipo: 'sucesso', texto: `Convite registrado para ${email}. Peça para o familiar criar uma conta com este email.` })
      setEmail('')
      fetchConvites()
    }
  }

  async function revogarAcesso(id) {
    await supabase.from('family_access').delete().eq('id', id)
    fetchConvites()
  }

  const statusLabel = { pendente: 'Pendente', aceito: 'Ativo' }
  const statusColor = { pendente: 'text-amber-600 bg-amber-50', aceito: 'text-green-700 bg-green-50' }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8">
      <h2 className="text-base font-semibold text-slate-800 mb-2">👨‍👩‍👦 Compartilhar com familiar</h2>
      <p className="text-sm text-slate-500 mb-6">
        Convide um familiar para acompanhar seu histórico. Ele precisará criar uma conta com o mesmo email.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="email@familiar.com"
        />
        <button
          type="submit"
          disabled={carregando}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-3 px-6 text-sm transition-colors whitespace-nowrap"
        >
          {carregando ? '...' : 'Convidar'}
        </button>
      </form>

      {mensagem && (
        <p className={`text-sm rounded-lg px-4 py-3 mb-6 ${
          mensagem.tipo === 'sucesso'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {mensagem.texto}
        </p>
      )}

      {convites.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2">Familiares convidados</h3>
          <ul className="space-y-2">
            {convites.map(c => (
              <li key={c.id} className="flex items-center justify-between text-sm border border-slate-100 rounded-lg px-4 py-3">
                <div>
                  <span className="text-slate-700">{c.email_convidado}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status]}`}>
                    {statusLabel[c.status]}
                  </span>
                </div>
                <button
                  onClick={() => revogarAcesso(c.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Revogar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
