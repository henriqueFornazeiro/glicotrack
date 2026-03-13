import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import GlucoseForm from '../components/registros/GlucoseForm'
import InsulinForm from '../components/registros/InsulinForm'
import MealForm from '../components/registros/MealForm'
import ActivityForm from '../components/registros/ActivityForm'
import MoodForm from '../components/registros/MoodForm'

const abas = [
  { id: 'glicemia', label: 'Glicemia', icon: '🩸' },
  { id: 'insulina', label: 'Insulina', icon: '💉' },
  { id: 'refeicao', label: 'Refeição', icon: '🍽️' },
  { id: 'atividade', label: 'Atividade', icon: '🏃' },
  { id: 'humor', label: 'Humor', icon: '😊' },
]

export default function Dashboard() {
  const { profile } = useAuth()
  const [abaAtiva, setAbaAtiva] = useState('glicemia')

  if (profile?.role === 'familiar') {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-4xl mb-4">📊</p>
        <p className="text-lg font-medium text-slate-700">Você tem acesso somente leitura.</p>
        <p className="text-sm mt-1">Acesse o <strong>Histórico</strong> para ver os dados.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-1">
        Olá, {profile?.nome?.split(' ')[0]} 👋
      </h1>
      <p className="text-sm text-slate-500 mb-8">O que você quer registrar agora?</p>

      {/* Abas */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {abas.map(aba => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              abaAtiva === aba.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {aba.icon} {aba.label}
          </button>
        ))}
      </div>

      {/* Formulário ativo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        {abaAtiva === 'glicemia' && <GlucoseForm />}
        {abaAtiva === 'insulina' && <InsulinForm />}
        {abaAtiva === 'refeicao' && <MealForm />}
        {abaAtiva === 'atividade' && <ActivityForm />}
        {abaAtiva === 'humor' && <MoodForm />}
      </div>
    </div>
  )
}
