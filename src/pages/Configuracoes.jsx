import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import GoalForm from '../components/configuracoes/GoalForm'
import InviteFamily from '../components/configuracoes/InviteFamily'

export default function Configuracoes() {
  const { profile } = useAuth()

  if (profile?.role === 'familiar') {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-4xl mb-4">🔒</p>
        <p>Esta página é exclusiva para o paciente.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Configurações</h1>
      <GoalForm />
      <InviteFamily />
    </div>
  )
}
