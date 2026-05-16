import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import { useCreateStep, useUpdateStep } from '../../hooks/useSteps'
import { useToast } from '../../context/ToastContext'

export default function StepModal({ open, onClose, platforms, platformId, editing }) {
  const [pid, setPid] = useState('')
  const [number, setNumber] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')

  const toast = useToast()
  const create = useCreateStep()
  const update = useUpdateStep()
  const isPending = create.isPending || update.isPending

  useEffect(() => {
    if (open) {
      setPid(editing?.platform_id ?? platformId ?? platforms?.[0]?.id ?? '')
      setNumber(editing?.number ?? '')
      setTitle(editing?.title ?? '')
      setSubtitle(editing?.subtitle ?? '')
    }
  }, [open, editing, platformId, platforms])

  async function handleSave() {
    if (!title.trim()) { toast('제목을 입력해주세요.'); return }
    const payload = {
      platform_id: pid,
      number: number.trim() || '??',
      title: title.trim(),
      subtitle: subtitle.trim(),
    }
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...payload })
    } else {
      await create.mutateAsync(payload)
    }
    toast('저장되었습니다.')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? '단계 수정' : '단계 추가'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>
            {isPending ? '저장 중…' : '저장'}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">플랫폼</label>
        <div className="select-wrap">
          <select className="form-select" value={pid} onChange={e => setPid(e.target.value)}>
            {(platforms ?? []).map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">단계 번호</label>
        <input className="form-input" value={number} onChange={e => setNumber(e.target.value)}
          placeholder="예: 00, 01, 02 …" />
      </div>
      <div className="form-group">
        <label className="form-label">단계 제목</label>
        <input className="form-input" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="단계 제목 입력" />
      </div>
      <div className="form-group">
        <label className="form-label">한 줄 설명 (선택)</label>
        <input className="form-input" value={subtitle} onChange={e => setSubtitle(e.target.value)}
          placeholder="이 단계에 대한 짧은 설명" />
      </div>
    </Modal>
  )
}
