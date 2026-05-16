import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const QK = (platformId) => ['steps', platformId]

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
