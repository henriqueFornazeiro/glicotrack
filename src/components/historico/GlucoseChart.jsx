import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, ReferenceArea,
} from 'recharts'

function formatarData(iso) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function TooltipCustom({ active, payload }) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm shadow">
      <p className="font-semibold text-slate-800">{v} mg/dL</p>
      <p className="text-slate-500 text-xs">{formatarData(payload[0].payload.registrado_em)}</p>
    </div>
  )
}

export default function GlucoseChart({ dados, meta }) {
  if (!dados.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
        Nenhum registro de glicemia no período.
      </div>
    )
  }

  const chartData = dados.map(d => ({ ...d, valor: d.valor }))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">🩸 Glicemia</h2>
      {meta && (
        <p className="text-xs text-slate-500 mb-3">
          Meta: <span className="font-medium">{meta.minimo} – {meta.maximo} mg/dL</span>
        </p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="registrado_em"
            tickFormatter={v => {
              const d = new Date(v)
              return `${d.getDate()}/${d.getMonth() + 1}`
            }}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={['auto', 'auto']} />
          <Tooltip content={<TooltipCustom />} />

          {meta && (
            <ReferenceArea
              y1={meta.minimo}
              y2={meta.maximo}
              fill="#dcfce7"
              fillOpacity={0.4}
            />
          )}
          {meta && <ReferenceLine y={meta.minimo} stroke="#86efac" strokeDasharray="4 4" />}
          {meta && <ReferenceLine y={meta.maximo} stroke="#86efac" strokeDasharray="4 4" />}

          <Line
            type="monotone"
            dataKey="valor"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={({ cx, cy, payload }) => {
              const foraDaMeta = meta && (payload.valor < meta.minimo || payload.valor > meta.maximo)
              return (
                <circle
                  key={payload.id}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={foraDaMeta ? '#ef4444' : '#3b82f6'}
                  stroke="white"
                  strokeWidth={1.5}
                />
              )
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
