import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import { useCreatePlatform, useUpdatePlatform } from '../../hooks/usePlatforms'
import { useToast } from '../../context/ToastContext'

export default function PlatformModal({ open, onClose, editing }) {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')

  const toast = useToast()
  const create = useCreatePlatform()
  const update = useUpdatePlatform()
  const isPending = create.isPending || update.isPending

  useEffect(() => {
    if (open) {
      setLabel(editing?.label ?? '')
      setDescription(editing?.description ?? '')
      setIcon(editing?.icon ?? '')
    }
  }, [open, editing])

  async function handleSave() {
    if (!label.trim()) { toast('가이드북 이름을 입력해주세요.'); return }
    const payload = { label: label.trim(), description: description.trim(), icon: icon.trim() || '📖' }
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
      title={editing ? '가이드북 수정' : '가이드북 추가'}
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
        <label className="form-label">가이드북 이름</label>
        <input className="form-input" value={label} onChange={e => setLabel(e.target.value)}
          placeholder="예: 워드프레스 가이드북" />
      </div>
      <div className="form-group">
        <label className="form-label">설명</label>
        <input className="form-input" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="이 가이드북에 대한 짧은 설명" />
      </div>
      <div className="form-group">
        <label className="form-label">아이콘 이모지 (선택)</label>
        <input className="form-input" value={icon} onChange={e => setIcon(e.target.value)}
          placeholder="예: 🌐" maxLength={4} style={{ maxWidth: 120 }} />
      </div>
    </Modal>
  )
}
