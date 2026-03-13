import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

function dataHoraLocal() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export default function ActivityForm() {
  const { user } = useAuth()
  const [registradoEm, setRegistradoEm] = useState(dataHoraLocal())
  const [mensagem, setMensagem] = useState(null)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setCarregando(true)
    setMensagem(null)
    const { error } = await supabase.from('activities').insert({
      paciente_id: user.id,
      registrado_em: new Date(registradoEm).toISOString(),
    })
    setCarregando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
    } else {
      setMensagem({ tipo: 'sucesso', texto: 'Atividade registrada com sucesso!' })
      setRegistradoEm(dataHoraLocal())
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-2">🏃 Registrar Atividade Física</h2>
      <p className="text-sm text-slate-500 mb-4">Registre que você realizou uma atividade física.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data e hora</label>
          <input
            type="datetime-local"
            required
            value={registradoEm}
            onChange={e => setRegistradoEm(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {mensagem && (
          <p className={`text-sm rounded-lg px-4 py-3 ${
            mensagem.tipo === 'sucesso'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {mensagem.texto}
          </p>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-3 text-sm transition-colors"
        >
          {carregando ? 'Salvando...' : '✓ Registrar atividade'}
        </button>
      </form>
    </div>
  )
}
