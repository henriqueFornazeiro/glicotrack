const tipoConfig = {
  insulina: { icon: '💉', label: 'Insulina', cor: 'bg-purple-50 border-purple-100' },
  refeicao: { icon: '🍽️', label: 'Refeição', cor: 'bg-orange-50 border-orange-100' },
  atividade: { icon: '🏃', label: 'Atividade física', cor: 'bg-green-50 border-green-100' },
  humor: { icon: '😊', label: 'Humor', cor: 'bg-yellow-50 border-yellow-100' },
}

const humorEmoji = { bem: '😊', regular: '😐', mal: '😞' }

function formatarDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function descricaoRegistro(r) {
  if (r.tipo === 'insulina') return `${r.dose} unidades`
  if (r.tipo === 'refeicao') return r.descricao
  if (r.tipo === 'atividade') return 'Realizada'
  if (r.tipo === 'humor') return `${humorEmoji[r.humor]} ${r.humor.charAt(0).toUpperCase() + r.humor.slice(1)}`
  return ''
}

export default function RegistrosList({ registros, glucoseData, meta }) {
  const todosOrdenados = [
    ...glucoseData.map(r => ({ ...r, tipo: 'glicemia' })),
    ...registros,
  ].sort((a, b) => new Date(b.registrado_em) - new Date(a.registrado_em))

  if (!todosOrdenados.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
        Nenhum registro no período.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">📋 Registros</h2>
      <ul className="space-y-2">
        {todosOrdenados.map(r => {
          if (r.tipo === 'glicemia') {
            const foraDaMeta = meta && (r.valor < meta.minimo || r.valor > meta.maximo)
            return (
              <li key={`g-${r.id}`} className={`flex items-center justify-between text-sm border rounded-lg px-3 py-2 ${foraDaMeta ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'}`}>
                <div className="flex items-center gap-2">
                  <span>🩸</span>
                  <span className={`font-semibold ${foraDaMeta ? 'text-red-700' : 'text-blue-700'}`}>
                    {r.valor} mg/dL
                  </span>
                  {foraDaMeta && <span className="text-red-500 text-xs font-medium">⚠️ Fora da meta</span>}
                </div>
                <span className="text-slate-400 text-xs">{formatarDataHora(r.registrado_em)}</span>
              </li>
            )
          }

          const config = tipoConfig[r.tipo]
          return (
            <li key={`${r.tipo}-${r.id}`} className={`flex items-center justify-between text-sm border rounded-lg px-3 py-2 ${config.cor}`}>
              <div className="flex items-center gap-2">
                <span>{config.icon}</span>
                <span className="text-slate-600">{descricaoRegistro(r)}</span>
              </div>
              <span className="text-slate-400 text-xs">{formatarDataHora(r.registrado_em)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
