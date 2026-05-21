import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

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

export function useReorderBlocks() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ step_id, blocks }) => {
      // blocks: [{id, order_index}, ...]
      await Promise.all(
        blocks.map(({ id, order_index }) =>
          supabase.from('blocks').update({ order_index }).eq('id', id)
        )
      )
      return { step_id }
    },
    onSuccess: ({ step_id }) => {
      qc.invalidateQueries({ queryKey: ['step', step_id] })
    },
  })
}

export function useCopyBlockToStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ block, targetStepId }) => {
      const { data: existing } = await supabase
        .from('blocks')
        .select('order_index')
        .eq('step_id', targetStepId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()
      const order_index = existing ? existing.order_index + 1 : 0

      const { data: newBlock, error } = await supabase
        .from('blocks')
        .insert({ step_id: targetStepId, type: block.type, label: block.label, content: block.content, order_index })
        .select()
        .single()
      if (error) throw error

      if (block.block_items?.length) {
        const rows = block.block_items.map((it, i) => ({
          block_id: newBlock.id, type: it.type, text: it.text, order_index: i,
        }))
        const { error: ie } = await supabase.from('block_items').insert(rows)
        if (ie) throw ie
      }
      return { newBlock, targetStepId }
    },
    onSuccess: ({ targetStepId }) => {
      qc.invalidateQueries({ queryKey: ['step', targetStepId] })
    },
  })
}

export function useDuplicateBlock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ block }) => {
      // 현재 블록 바로 뒤 order_index 계산
      const { data: siblings } = await supabase
        .from('blocks')
        .select('order_index')
        .eq('step_id', block.step_id)
        .gt('order_index', block.order_index)
        .order('order_index', { ascending: true })
        .limit(1)
      const nextIndex = siblings?.[0]?.order_index ?? null
      const newIndex = nextIndex !== null
        ? (block.order_index + nextIndex) / 2
        : block.order_index + 1

      const { data: newBlock, error } = await supabase
        .from('blocks')
        .insert({ step_id: block.step_id, type: block.type, label: block.label, content: block.content, order_index: newIndex })
        .select()
        .single()
      if (error) throw error

      if (block.block_items?.length) {
        const rows = block.block_items.map((it, i) => ({
          block_id: newBlock.id, type: it.type, text: it.text, order_index: i,
        }))
        const { error: ie } = await supabase.from('block_items').insert(rows)
        if (ie) throw ie
      }
      return newBlock
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
