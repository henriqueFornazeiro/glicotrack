import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function GoalForm() {
  const { user } = useAuth()
  const [minimo, setMinimo] = useState('')
  const [maximo, setMaximo] = useState('')
  const [metaAtual, setMetaAtual] = useState(null)
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
      if (data) {
        setMetaAtual(data)
        setMinimo(String(data.minimo))
        setMaximo(String(data.maximo))
      }
    }
    fetchMeta()
  }, [user.id])

  async function handleSubmit(e) {
    e.preventDefault()
    setCarregando(true)
    setMensagem(null)
    const minimoNum = parseInt(minimo)
    const maximoNum = parseInt(maximo)
    if (minimoNum >= maximoNum) {
      setMensagem({ tipo: 'erro', texto: 'O valor mínimo deve ser menor que o máximo.' })
      setCarregando(false)
      return
    }
    const { error } = await supabase.from('glucose_targets').insert({
      paciente_id: user.id,
      minimo: minimoNum,
      maximo: maximoNum,
    })
    setCarregando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
    } else {
      setMetaAtual({ minimo: minimoNum, maximo: maximoNum })
      setMensagem({ tipo: 'sucesso', texto: 'Meta atualizada com sucesso!' })
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8">
      <h2 className="text-base font-semibold text-slate-800 mb-2">🎯 Meta de Glicemia</h2>
      <p className="text-sm text-slate-500 mb-6">
        Defina conforme orientação do seu médico.
        {metaAtual && (
          <span className="ml-1 font-medium text-slate-700">
            Atual: {metaAtual.minimo} – {metaAtual.maximo} mg/dL
          </span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Mínimo (mg/dL)</label>
            <input
              type="number"
              required
              min="40"
              max="400"
              value={minimo}
              onChange={e => setMinimo(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 70"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Máximo (mg/dL)</label>
            <input
              type="number"
              required
              min="40"
              max="600"
              value={maximo}
              onChange={e => setMaximo(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 180"
            />
          </div>
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
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-3 px-8 text-sm transition-colors"
        >
          {carregando ? 'Salvando...' : 'Salvar meta'}
        </button>
      </form>
    </div>
  )
}
