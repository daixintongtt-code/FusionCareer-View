import { apiJson, apiForm } from '@/lib/api'

/** 与后端 upload.allowed-extensions 一致 */
export const ALLOWED_UPLOAD_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']

export function validateQuestionnaireUploadFile(file) {
  if (!file) return '请选择文件'
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(ext)) {
    return '仅支持 PDF、JPG、PNG'
  }
  if (file.size > 20 * 1024 * 1024) {
    return '单文件不超过 20MB'
  }
  return null
}

/** Tab key → 后端 status 查询参数 */
export const APPLICATION_TAB_STATUS = {
  all: null,
  draft: 'DRAFT',
  pending: 'SUBMITTED',
  done: 'REVIEWED',
}

/** 列表项 submissionStatus → Tab 筛选 key */
export function submissionStatusToTabKey(status) {
  if (status === 'DRAFT') return 'draft'
  if (status === 'SUBMITTED') return 'pending'
  if (status === 'REVIEWED') return 'done'
  return 'pending'
}

export function normQuestions(list) {
  return (list || [])
    .slice()
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((q) => ({
      id: q.id,
      title: q.title,
      type: q.questionType,
      required: !!q.required,
      placeholder: q.placeholder || '',
      options: Array.isArray(q.options) ? q.options : [],
    }))
}

export function resumeFileIconByName(name) {
  const n = (name || '').toLowerCase()
  if (n.endsWith('.pdf')) return 'ti-file-type-pdf'
  if (n.endsWith('.png') || n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'ti-photo'
  return 'ti-file-type-doc'
}

export function mapResumeFilesForPicker(files) {
  return (files || []).map((f) => ({
    id: f.id,
    name: f.originalName,
    icon: resumeFileIconByName(f.originalName),
  }))
}

export async function loadQuestionnaireBundle(jobPostId) {
  const data = await apiJson(`/questionnaire/questions/${jobPostId}`)
  return {
    questions: normQuestions(data?.questions || []),
    expired: !!data?.expired,
    questionnaireDeadline: data?.questionnaireDeadline || '',
    sourceUrl: data?.sourceUrl || '',
  }
}

export async function loadMyAnswerRecord(jobPostId) {
  try {
    return await apiJson(`/questionnaire/my/${jobPostId}`)
  } catch {
    return null
  }
}

export async function loadResumeFileList() {
  try {
    return await apiJson('/user/resume/file/list')
  } catch {
    return []
  }
}

export async function loadMyApplicationsPage(activeTab, page = 1, size = 50) {
  const status = APPLICATION_TAB_STATUS[activeTab]
  let path = `/questionnaire/my/list?page=${page}&size=${size}`
  if (status) path += `&status=${status}`
  const data = await apiJson(path)
  return {
    list: data?.page?.list || [],
    tabCounts: data?.tabCounts || {},
  }
}

/**
 * 解析 answers JSON，写入详情页结构（answers + fileAnswers{id,name}）
 */
export function applyParsedToDetailForm(questions, answersJson, resumeFiles, answers, fileAnswers) {
  let arr
  try {
    arr = typeof answersJson === 'string' ? JSON.parse(answersJson) : answersJson
  } catch {
    return
  }
  if (!Array.isArray(arr)) return

  const byId = new Map(questions.map((q) => [q.id, q]))
  const fileList = resumeFiles || []

  for (const row of arr) {
    const qid = row.questionId
    const q = byId.get(qid)
    const raw = row.value
    if (!q) continue
    if (q.type === 'FILE_UPLOAD') {
      const sid = raw != null ? String(raw) : ''
      if (!sid) continue
      const fromList = fileList.find((f) => String(f.id) === sid)
      fileAnswers[qid] = {
        id: Number(sid),
        name: fromList?.originalName || `文件 #${sid}`,
      }
    } else if (q.type === 'CHECKBOX') {
      const parts =
        typeof raw === 'string' ? raw.split(',').map((s) => s.trim()).filter(Boolean) : []
      answers[qid] = parts
    } else {
      answers[qid] = raw ?? ''
    }
  }
}

/**
 * 解析 answers JSON，写入个人中心弹窗（editAnswers 显示文件名 + fileIds）
 */
export function applyParsedToProfileForm(questions, answersJson, resumeFiles, editAnswers, fileIds) {
  let arr
  try {
    arr = typeof answersJson === 'string' ? JSON.parse(answersJson) : answersJson
  } catch {
    return
  }
  if (!Array.isArray(arr)) return

  const byId = new Map(questions.map((q) => [q.id, q]))
  const fileList = resumeFiles || []

  for (const row of arr) {
    const qid = row.questionId
    const q = byId.get(qid)
    const raw = row.value
    if (!q) continue
    if (q.type === 'FILE_UPLOAD') {
      const sid = raw != null ? String(raw) : ''
      if (!sid) continue
      const fromList = fileList.find((f) => String(f.id) === sid)
      const displayName = fromList?.originalName || `文件 #${sid}`
      editAnswers[qid] = displayName
      fileIds[qid] = Number(sid)
    } else if (q.type === 'CHECKBOX') {
      const parts =
        typeof raw === 'string' ? raw.split(',').map((s) => s.trim()).filter(Boolean) : []
      editAnswers[qid] = parts
    } else {
      editAnswers[qid] = raw ?? ''
    }
  }
}

export function validateRequiredAnswers(questions, textAnswers, fileAnswersOrIds) {
  for (const q of questions) {
    if (!q.required) continue
    if (q.type === 'FILE_UPLOAD') {
      const fa = fileAnswersOrIds[q.id]
      if (fa == null || fa === '' || (typeof fa === 'object' && !fa.id)) {
        return `请填写「${q.title}」`
      }
    } else {
      const v = textAnswers[q.id]
      if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
        return `请填写「${q.title}」`
      }
    }
  }
  return null
}

/** fileAnswersOrIds: 详情页 {id,name} 或 Profile fileIds 数字 */
export function buildAnswersJson(questions, textAnswers, fileAnswersOrIds) {
  const rows = []
  for (const q of questions) {
    if (q.type === 'FILE_UPLOAD') {
      const fa = fileAnswersOrIds[q.id]
      const id = typeof fa === 'object' && fa != null ? fa.id : fa
      rows.push({ questionId: q.id, value: String(id) })
    } else if (q.type === 'CHECKBOX') {
      const arr = textAnswers[q.id] || []
      rows.push({ questionId: q.id, value: arr.join(',') })
    } else {
      rows.push({ questionId: q.id, value: String(textAnswers[q.id] ?? '') })
    }
  }
  return JSON.stringify(rows)
}

function buildSubmitBody(jobPostId, questions, textAnswers, fileAnswersOrIds) {
  return {
    jobPostId: Number(jobPostId),
    answers: buildAnswersJson(questions, textAnswers, fileAnswersOrIds),
  }
}

export async function submitQuestionnaire(jobPostId, questions, textAnswers, fileAnswersOrIds) {
  return apiJson('/questionnaire/submit', {
    method: 'POST',
    body: JSON.stringify(buildSubmitBody(jobPostId, questions, textAnswers, fileAnswersOrIds)),
  })
}

/** 存草稿（不校验必填；已 SUBMITTED 时后端会拒绝） */
export async function saveDraftQuestionnaire(jobPostId, questions, textAnswers, fileAnswersOrIds) {
  return apiJson('/questionnaire/draft', {
    method: 'POST',
    body: JSON.stringify(buildSubmitBody(jobPostId, questions, textAnswers, fileAnswersOrIds)),
  })
}

export async function uploadQuestionnaireFile(file) {
  const fd = new FormData()
  fd.append('file', file)
  return apiForm('/questionnaire/upload', fd)
}

export function canEditApplication(app) {
  if (!app) return false
  if (app.sourceUrl) return false
  if (app.expired) return false
  if (app.submissionStatus === 'REVIEWED') return false
  return true
}
