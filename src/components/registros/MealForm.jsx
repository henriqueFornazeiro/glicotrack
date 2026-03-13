import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

function dataHoraLocal() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

const opcoes = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar', 'Ceia', 'Outro']

export default function MealForm() {
  const { user } = useAuth()
  const [descricao, setDescricao] = useState('')
  const [registradoEm, setRegistradoEm] = useState(dataHoraLocal())
  const [mensagem, setMensagem] = useState(null)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setCarregando(true)
    setMensagem(null)
    const { error } = await supabase.from('meals').insert({
      paciente_id: user.id,
      descricao,
      registrado_em: new Date(registradoEm).toISOString(),
    })
    setCarregando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
    } else {
      setMensagem({ tipo: 'sucesso', texto: 'Refeição registrada com sucesso!' })
      setDescricao('')
      setRegistradoEm(dataHoraLocal())
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">🍽️ Registrar Refeição</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Refeição</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {opcoes.map(op => (
              <button
                key={op}
                type="button"
                onClick={() => setDescricao(op)}
                className={`py-3 px-4 rounded-lg text-sm border transition-colors ${
                  descricao === op
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {op}
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
          disabled={carregando || !descricao}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-3 text-sm transition-colors"
        >
          {carregando ? 'Salvando...' : 'Registrar'}
        </button>
      </form>
    </div>
  )
}
