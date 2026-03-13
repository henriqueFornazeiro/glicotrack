import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

function dataHoraLocal() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export default function GlucoseForm() {
  const { user } = useAuth()
  const [valor, setValor] = useState('')
  const [registradoEm, setRegistradoEm] = useState(dataHoraLocal())
  const [meta, setMeta] = useState(null)
  const [mensagem, setMensagem] = useState(null)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    async function fetchMeta() {
      const { data } = await supabase
        .from('glucose_targets')
        .select('*')
        .eq('paciente_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) setMeta(data)
    }
    fetchMeta()
  }, [user.id])

  const valorNum = parseInt(valor)
  const foraDaMeta = meta && valor && (valorNum < meta.minimo || valorNum > meta.maximo)

  async function handleSubmit(e) {
    e.preventDefault()
    setCarregando(true)
    setMensagem(null)
    const { error } = await supabase.from('glucose_readings').insert({
      paciente_id: user.id,
      valor: valorNum,
      registrado_em: new Date(registradoEm).toISOString(),
    })
    setCarregando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
    } else {
      setMensagem({ tipo: 'sucesso', texto: 'Glicemia registrada com sucesso!' })
      setValor('')
      setRegistradoEm(dataHoraLocal())
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">🩸 Registrar Glicemia</h2>

      {meta && (
        <p className="text-xs text-slate-500 mb-4">
          Meta: <span className="font-medium">{meta.minimo} – {meta.maximo} mg/dL</span>
        </p>
      )}

      {!meta && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
          Você ainda não configurou sua meta de glicemia. Acesse Configurações para definir.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Valor (mg/dL)
          </label>
          <div className="relative">
            <input
              type="number"
              required
              min="20"
              max="600"
              value={valor}
              onChange={e => setValor(e.target.value)}
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                foraDaMeta
                  ? 'border-red-400 bg-red-50 focus:ring-red-400 text-red-700 font-bold'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
              placeholder="Ex: 120"
            />
            {foraDaMeta && (
              <span className="absolute right-3 top-2 text-red-600 text-sm font-bold">⚠️ Fora da meta</span>
            )}
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
          disabled={carregando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-3 text-sm transition-colors"
        >
          {carregando ? 'Salvando...' : 'Registrar'}
        </button>
      </form>
    </div>
  )
}
