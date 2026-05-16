import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '/supabase'

export function useCreateBlock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ step_id, type, label, content, items }) => {
      const { data: existing } = await supabase
        .from('blocks')
        .select('order_index')
        .eq('step_id', step_id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()
      const order_index = existing ? existing.order_index + 1 : 0
      const { data: block, error } = await supabase
        .from('blocks')
        .insert({ step_id, type, label, content, order_index })
        .select()
        .single()
      if (error) throw error
      if (items?.length) {
        const rows = items.map((it, i) => ({
          block_id: block.id, type: it.type, text: it.text, order_index: i,
        }))
        const { error: ie } = await supabase.from('block_items').insert(rows)
        if (ie) throw ie
      }
      return block
    },
    onSuccess: (block) => {
      qc.invalidateQueries({ queryKey: ['step', block.step_id] })
    },
  })
}

export function useUpdateBlock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, step_id, type, label, content, items }) => {
      const { data: block, error } = await supabase
        .from('blocks')
        .update({ type, label, content })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      // Replace items: delete all, re-insert
      await supabase.from('block_items').delete().eq('block_id', id)
      if (items?.length) {
        const rows = items.map((it, i) => ({
          block_id: id, type: it.type, text: it.text, order_index: i,
        }))
        const { error: ie } = await supabase.from('block_items').insert(rows)
        if (ie) throw ie
      }
      return block
    },
    onSuccess: (block) => {
      qc.invalidateQueries({ queryKey: ['step', block.step_id] })
    },
  })
}

export function useDeleteBlock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, step_id }) => {
      const { error } = await supabase.from('blocks').delete().eq('id', id)
      if (error) throw error
      return { step_id }
    },
    onSuccess: ({ step_id }) => {
      qc.invalidateQueries({ queryKey: ['step', step_id] })
    },
  })
}
