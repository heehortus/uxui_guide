import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const QK = ['platforms']

export function usePlatforms() {
  return useQuery({
    queryKey: QK,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .order('order_index')
      if (error) throw error
      return data
    },
  })
}

export function useCreatePlatform() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ label, description, icon }) => {
      const { data: existing } = await supabase
        .from('platforms')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1)
        .single()
      const order_index = existing ? existing.order_index + 1 : 0
      const { data, error } = await supabase
        .from('platforms')
        .insert({ label, description, icon, order_index })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useUpdatePlatform() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, label, description, icon }) => {
      const { data, error } = await supabase
        .from('platforms')
        .update({ label, description, icon })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useReorderPlatforms() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (platforms) => {
      await Promise.all(platforms.map(({ id, order_index }) =>
        supabase.from('platforms').update({ order_index }).eq('id', id)
      ))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useDeletePlatform() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('platforms').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}
