import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import GlucoseChart from '../components/historico/GlucoseChart'
import RegistrosList from '../components/historico/RegistrosList'

const periodos = [
  { label: '7 dias', dias: 7 },
  { label: '30 dias', dias: 30 },
  { label: '90 dias', dias: 90 },
]

export default function Historico() {
  const { user, profile } = useAuth()
  const [periodoDias, setPeriodoDias] = useState(7)
  const [pacienteId, setPacienteId] = useState(null)
  const [glucoseData, setGlucoseData] = useState([])
  const [registros, setRegistros] = useState([])
  const [meta, setMeta] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function resolvePacienteId() {
      if (profile?.role === 'paciente') {
        setPacienteId(user.id)
      } else {
        const { data } = await supabase
          .from('family_access')
          .select('paciente_id')
          .eq('familiar_id', user.id)
          .eq('status', 'aceito')
          .limit(1)
          .single()
        if (data) setPacienteId(data.paciente_id)
      }
    }
    if (profile) resolvePacienteId()
  }, [profile, user.id])

  useEffect(() => {
    if (!pacienteId) return
    fetchDados()
  }, [pacienteId, periodoDias])

  async function fetchDados() {
    setCarregando(true)
    const desde = new Date()
    desde.setDate(desde.getDate() - periodoDias)
    const desdeISO = desde.toISOString()

    const [glucose, insulina, refeicoes, atividades, humores, metaData] = await Promise.all([
      supabase.from('glucose_readings').select('*').eq('paciente_id', pacienteId).gte('registrado_em', desdeISO).order('registrado_em'),
      supabase.from('insulin_records').select('*').eq('paciente_id', pacienteId).gte('registrado_em', desdeISO).order('registrado_em', { ascending: false }),
      supabase.from('meals').select('*').eq('paciente_id', pacienteId).gte('registrado_em', desdeISO).order('registrado_em', { ascending: false }),
      supabase.from('activities').select('*').eq('paciente_id', pacienteId).gte('registrado_em', desdeISO).order('registrado_em', { ascending: false }),
      supabase.from('mood_records').select('*').eq('paciente_id', pacienteId).gte('registrado_em', desdeISO).order('registrado_em', { ascending: false }),
      supabase.from('glucose_targets').select('*').eq('paciente_id', pacienteId).order('created_at', { ascending: false }).limit(1).single(),
    ])

    setGlucoseData(glucose.data ?? [])
    setMeta(metaData.data ?? null)

    const todos = [
      ...(insulina.data ?? []).map(r => ({ ...r, tipo: 'insulina' })),
      ...(refeicoes.data ?? []).map(r => ({ ...r, tipo: 'refeicao' })),
      ...(atividades.data ?? []).map(r => ({ ...r, tipo: 'atividade' })),
      ...(humores.data ?? []).map(r => ({ ...r, tipo: 'humor' })),
    ].sort((a, b) => new Date(b.registrado_em) - new Date(a.registrado_em))

    setRegistros(todos)
    setCarregando(false)
  }

  if (!pacienteId && !carregando) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-4xl mb-4">🔗</p>
        <p className="font-medium text-slate-700">Nenhum paciente vinculado.</p>
        <p className="text-sm mt-1">Aguarde o convite do paciente ser aceito.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Histórico</h1>
        <div className="flex gap-1">
          {periodos.map(p => (
            <button
              key={p.dias}
              onClick={() => setPeriodoDias(p.dias)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                periodoDias === p.dias
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {carregando ? (
        <p className="text-slate-500 text-sm">Carregando...</p>
      ) : (
        <>
          <GlucoseChart dados={glucoseData} meta={meta} />
          <RegistrosList registros={registros} glucoseData={glucoseData} meta={meta} />
        </>
      )}
    </div>
  )
}
