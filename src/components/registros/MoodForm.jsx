import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

function dataHoraLocal() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

const opcoes = [
  { valor: 'bem', label: 'Bem', emoji: '😊' },
  { valor: 'regular', label: 'Regular', emoji: '😐' },
  { valor: 'mal', label: 'Mal', emoji: '😞' },
]

export default function MoodForm() {
  const { user } = useAuth()
  const [humor, setHumor] = useState('')
  const [registradoEm, setRegistradoEm] = useState(dataHoraLocal())
  const [mensagem, setMensagem] = useState(null)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setCarregando(true)
    setMensagem(null)
    const { error } = await supabase.from('mood_records').insert({
      paciente_id: user.id,
      humor,
      registrado_em: new Date(registradoEm).toISOString(),
    })
    setCarregando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
    } else {
      setMensagem({ tipo: 'sucesso', texto: 'Humor registrado com sucesso!' })
      setHumor('')
      setRegistradoEm(dataHoraLocal())
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">😊 Registrar Humor</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Como você está se sentindo?</label>
          <div className="flex gap-3">
            {opcoes.map(op => (
              <button
                key={op.valor}
                type="button"
                onClick={() => setHumor(op.valor)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                  humor === op.valor
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl">{op.emoji}</span>
                <span className="text-xs font-medium text-slate-700">{op.label}</span>
              </button>
            ))}
          </div>
        </div>

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
          disabled={carregando || !humor}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-3 text-sm transition-colors"
        >
          {carregando ? 'Salvando...' : 'Registrar'}
        </button>
      </form>
    </div>
  )
}
