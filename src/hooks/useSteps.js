import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const QK = (platformId) => ['steps', platformId]

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

      // 2. 링크 목록 content 검색
      const { data: blockResults = [], error: e2 } = await supabase
        .from('blocks')
        .select('content, steps(id, title, subtitle, number, platform_id, platforms(label))')
        .in('type', ['links', 'links-file'])
        .ilike('content', `%${q}%`)
        .limit(20)
      if (e2) throw e2

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
        const matchLine = (b.content || '').split('\n').find(l =>
          l.toLowerCase().includes(q.toLowerCase())
        )
        const matchName = matchLine ? matchLine.split('|')[0]?.trim() : ''
        if (!seen.has(s.id)) {
          seen.add(s.id)
          merged.push({ ...s, matchedLinkName: matchName })
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
