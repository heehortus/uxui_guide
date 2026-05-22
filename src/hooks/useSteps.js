import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const QK = (platformId) => ['steps', platformId]

function extractSnippet(content, type, label, q) {
  const ql = q.toLowerCase()

  // label이 매칭되면 label을 스니펫으로
  if (label && label.toLowerCase().includes(ql)) return label

  if (!content) return ''

  // links/links-file: 링크명 추출
  if (type === 'links' || type === 'links-file') {
    const matchLine = content.split('\n').find(l => l.toLowerCase().includes(ql))
    return matchLine ? matchLine.split('|')[0]?.trim() : ''
  }

  // process: 단계 제목 추출
  if (type === 'process') {
    const matchLine = content.split('\n').find(l => l.toLowerCase().includes(ql))
    return matchLine ? matchLine.split('|')[0]?.trim() : ''
  }

  // kakao: 매칭 라인
  if (type === 'kakao') {
    const matchLine = content.split('\n').find(l => l.toLowerCase().includes(ql))
    return matchLine ? matchLine.replace(/^# /, '').trim() : ''
  }

  // 그 외(default, tip, warning, info, code 등): HTML 제거 후 스니펫
  const stripped = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const idx = stripped.toLowerCase().indexOf(ql)
  if (idx === -1) return stripped.slice(0, 60)
  const start = Math.max(0, idx - 20)
  const end = Math.min(stripped.length, idx + ql.length + 40)
  return (start > 0 ? '…' : '') + stripped.slice(start, end) + (end < stripped.length ? '…' : '')
}

export function useSearchSteps(query) {
  return useQuery({
    queryKey: ['steps-search', query],
    queryFn: async () => {
      const q = query.trim()

      // 1. step title/subtitle 검색
      const { data: stepResults = [], error: e1 } = await supabase
        .from('steps')
        .select('id, title, subtitle, number, platform_id, platforms(label)')
        .or(`title.ilike.%${q}%,subtitle.ilike.%${q}%`)
        .order('platform_id')
        .limit(20)
      if (e1) throw e1

      // 2. 모든 블록 content/label 검색
      const { data: blockResults = [], error: e2 } = await supabase
        .from('blocks')
        .select('content, label, type, steps(id, title, subtitle, number, platform_id, platforms(label))')
        .or(`content.ilike.%${q}%,label.ilike.%${q}%`)
        .limit(30)
      if (e2) throw e2

      // 3. block_items text 검색
      const { data: itemResults = [], error: e3 } = await supabase
        .from('block_items')
        .select('text, blocks(label, type, step_id, steps(id, title, subtitle, number, platform_id, platforms(label)))')
        .ilike('text', `%${q}%`)
        .limit(20)
      if (e3) throw e3

      // 중복 제거 후 병합
      const seen = new Set()
      const merged = []

      for (const r of stepResults) {
        if (!seen.has(r.id)) {
          seen.add(r.id)
          merged.push(r)
        }
      }

      for (const b of blockResults) {
        const s = b.steps
        if (!s) continue
        const snippet = extractSnippet(b.content, b.type, b.label, q)
        if (!seen.has(s.id)) {
          seen.add(s.id)
          merged.push({ ...s, matchedLinkName: snippet })
        }
      }

      for (const it of itemResults) {
        const blk = it.blocks
        const s = blk?.steps
        if (!s) continue
        if (!seen.has(s.id)) {
          seen.add(s.id)
          // item text에서 스니펫 추출 (HTML 제거)
          const stripped = (it.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
          const ql = q.toLowerCase()
          const idx = stripped.toLowerCase().indexOf(ql)
          const start = Math.max(0, idx - 20)
          const end = Math.min(stripped.length, idx + ql.length + 40)
          const snippet = (start > 0 ? '…' : '') + stripped.slice(start, end) + (end < stripped.length ? '…' : '')
          merged.push({ ...s, matchedLinkName: snippet })
        }
      }

      merged.sort((a, b) => (a.platform_id || '').localeCompare(b.platform_id || ''))
      return merged
    },
    enabled: query.trim().length > 0,
  })
}

export function useSteps(platformId) {
  return useQuery({
    queryKey: QK(platformId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('steps')
        .select('*')
        .eq('platform_id', platformId)
        .order('order_index')
      if (error) throw error
      return data
    },
    enabled: !!platformId,
  })
}

export function useStep(stepId) {
  return useQuery({
    queryKey: ['step', stepId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('steps')
        .select('*, blocks(*, block_items(*))')
        .eq('id', stepId)
        .order('order_index', { referencedTable: 'blocks' })
        .order('order_index', { referencedTable: 'blocks.block_items' })
        .single()
      if (error) throw error
      // Sort nested arrays (Supabase nested order is limited)
      if (data.blocks) {
        data.blocks.sort((a, b) => a.order_index - b.order_index)
        data.blocks.forEach(b => {
          if (b.block_items) b.block_items.sort((a, c) => a.order_index - c.order_index)
        })
      }
      return data
    },
    enabled: !!stepId,
  })
}

export function useCreateStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ platform_id, number, title, subtitle }) => {
      const { data: existing } = await supabase
        .from('steps')
        .select('order_index')
        .eq('platform_id', platform_id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()
      const order_index = existing ? existing.order_index + 1 : 0
      const { data, error } = await supabase
        .from('steps')
        .insert({ platform_id, number, title, subtitle, order_index })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QK(data.platform_id) })
    },
  })
}

export function useUpdateStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, platform_id, number, title, subtitle }) => {
      const { data, error } = await supabase
        .from('steps')
        .update({ platform_id, number, title, subtitle })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QK(data.platform_id) })
      qc.invalidateQueries({ queryKey: ['step', data.id] })
    },
  })
}

export function useReorderSteps() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ platform_id, steps }) => {
      await Promise.all(steps.map(({ id, order_index }) =>
        supabase.from('steps').update({ order_index }).eq('id', id)
      ))
      return { platform_id }
    },
    onSuccess: ({ platform_id }) => {
      qc.invalidateQueries({ queryKey: QK(platform_id) })
    },
  })
}

export function useDeleteStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, platform_id }) => {
      const { error } = await supabase.from('steps').delete().eq('id', id)
      if (error) throw error
      return { platform_id }
    },
    onSuccess: ({ platform_id }) => {
      qc.invalidateQueries({ queryKey: QK(platform_id) })
    },
  })
}
