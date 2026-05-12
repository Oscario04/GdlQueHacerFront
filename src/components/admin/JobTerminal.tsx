import { useEffect, useRef, useState } from 'react'
import { Loader2, CheckCircle2, XCircle, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  jobId: string
  onFinish?: (status: 'done' | 'error') => void
}

export default function JobTerminal({ jobId, onFinish }: Props) {
  const [lines, setLines] = useState<string[]>([])
  const [status, setStatus] = useState<'running' | 'done' | 'error'>('running')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('gdl_token') ?? ''
    const es = new EventSource(`/api/admin/logs/${jobId}?token=${encodeURIComponent(token)}`)

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.line) {
          setLines((prev) => [...prev, data.line])
        }
        if (data.status) {
          setStatus(data.status)
          onFinish?.(data.status)
          es.close()
        }
      } catch { /* ignorar parse errors */ }
    }

    es.onerror = () => {
      setLines((prev) => [...prev, '[ERROR] Conexión perdida con el servidor.'])
      setStatus('error')
      onFinish?.('error')
      es.close()
    }

    return () => es.close()
  }, [jobId])

  // Auto-scroll al fondo cuando llegan nuevas líneas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const getLineColor = (line: string) => {
    if (line.includes('❌') || line.includes('Error') || line.includes('error'))
      return 'text-rose-400'
    if (line.includes('✅') || line.includes('completado') || line.includes('Guardado'))
      return 'text-emerald-400'
    if (line.includes('⚠️') || line.includes('Warning') || line.includes('Saltando'))
      return 'text-amber-400'
    if (line.includes('━') || line.includes('==='))
      return 'text-stone-600'
    if (line.includes('🕷️') || line.includes('🧠') || line.includes('📦') || line.includes('💾'))
      return 'text-orange-400'
    return 'text-stone-300'
  }

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--gdl-border)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          background: 'rgba(0,0,0,0.5)',
          borderColor: 'var(--gdl-border)',
        }}>
        <div className="flex items-center gap-2">
          {/* Semáforo estilo macOS */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <Terminal size={12} className="text-stone-500 ml-2" />
          <span className="text-xs text-stone-500 font-mono">
            job/{jobId.slice(0, 8)}...
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {status === 'running' && (
            <>
              <Loader2 size={12} className="text-orange-400 animate-spin" />
              <span className="text-xs text-orange-400 font-mono">running</span>
            </>
          )}
          {status === 'done' && (
            <>
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-mono">done</span>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle size={12} className="text-rose-400" />
              <span className="text-xs text-rose-400 font-mono">error</span>
            </>
          )}
        </div>
      </div>

      {/* Logs */}
      <div
        className="h-72 overflow-y-auto p-4 flex flex-col gap-0.5"
        style={{ background: 'rgba(0,0,0,0.7)', fontFamily: 'monospace' }}>
        {lines.length === 0 && (
          <span className="text-stone-600 text-xs">Conectando...</span>
        )}
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn('text-xs leading-relaxed whitespace-pre-wrap', getLineColor(line))}>
            {line}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Footer con contador */}
      <div className="px-4 py-1.5 border-t flex items-center justify-between"
        style={{
          background: 'rgba(0,0,0,0.4)',
          borderColor: 'var(--gdl-border)',
        }}>
        <span className="text-[10px] text-stone-600 font-mono">
          {lines.length} líneas
        </span>
        {status === 'running' && (
          <span className="text-[10px] text-stone-600 font-mono animate-pulse">
            ● live
          </span>
        )}
      </div>
    </div>
  )
}