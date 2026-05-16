import { useState, useEffect, useRef } from 'react'
import Modal from '../ui/Modal'
import { useCreatePlatform, useUpdatePlatform } from '../../hooks/usePlatforms'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

export default function PlatformModal({ open, onClose, editing }) {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [iconUrl, setIconUrl] = useState('')     // existing or newly uploaded URL
  const [iconFile, setIconFile] = useState(null) // File object pending upload
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const toast = useToast()
  const create = useCreatePlatform()
  const update = useUpdatePlatform()
  const isPending = create.isPending || update.isPending

  useEffect(() => {
    if (open) {
      setLabel(editing?.label ?? '')
      setDescription(editing?.description ?? '')
      // Only treat as URL if it starts with http (ignore old emoji values)
      const existing = editing?.icon ?? ''
      setIconUrl(existing.startsWith('http') ? existing : '')
      setIconFile(null)
    }
  }, [open, editing])

  async function handleSave() {
    if (!label.trim()) { toast('가이드북 이름을 입력해주세요.'); return }

    let finalIcon = iconUrl

    if (iconFile) {
      setUploading(true)
      try {
        const ext = iconFile.name.split('.').pop()
        const path = `icons/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('uploads').upload(path, iconFile)
        if (error) throw error
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path)
        finalIcon = urlData.publicUrl
      } catch (err) {
        toast('아이콘 업로드 실패: ' + err.message)
        setUploading(false)
        return
      }
      setUploading(false)
    }

    const payload = { label: label.trim(), description: description.trim(), icon: finalIcon }
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...payload })
    } else {
      await create.mutateAsync(payload)
    }
    toast('저장되었습니다.')
    onClose()
  }

  const previewSrc = iconFile ? URL.createObjectURL(iconFile) : iconUrl

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? '가이드북 수정' : '가이드북 추가'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isPending || uploading}>
            {uploading ? '업로드 중…' : isPending ? '저장 중…' : '저장'}
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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
          <label className="form-label" style={{ margin: 0 }}>아이콘 추가 (선택)</label>
          <span className="form-hint" style={{ margin: 0 }}>권장 크기: 240X240, 투명 이미지로 업로드해주세요.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {previewSrc && (
            <img
              src={previewSrc}
              alt="아이콘 미리보기"
              className="platform-icon-preview"
            />
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            {previewSrc ? '이미지 변경' : '이미지 선택'}
          </button>
          {previewSrc && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--destructive)' }}
              onClick={() => { setIconUrl(''); setIconFile(null) }}
              type="button"
            >
              삭제
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files[0]) {
                setIconFile(e.target.files[0])
                setIconUrl('')
              }
              e.target.value = ''
            }}
          />
        </div>
      </div>
    </Modal>
  )
}
