const TOKEN_KEY = 'fusion-career-token'

export function readApiPrefix() {
  const readBase = import.meta.env.VITE_API_BASE
  return readBase == null || String(readBase).trim() === ''
    ? '/api'
    : String(readBase).replace(/\/$/, '')
}

export function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function saveToken(saveValue) {
  try {
    if (saveValue) localStorage.setItem(TOKEN_KEY, saveValue)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* 浏览器禁用存储时由接口 401 处理 */ }
}

export function deleteToken() {
  saveToken('')
}

export function buildUrl(readPath) {
  const readValue = readPath.startsWith('/') ? readPath : `/${readPath}`
  return `${readApiPrefix()}${readValue}`
}

export async function requestApi(readPath, readOptions = {}) {
  const updateHeaders = new Headers(readOptions.headers || {})
  const readValue = readToken()
  if (readValue) updateHeaders.set('Fusion-Token', readValue)
  if (readOptions.body != null && !(readOptions.body instanceof FormData)
      && !updateHeaders.has('Content-Type')) {
    updateHeaders.set('Content-Type', 'application/json')
  }

  const readResponse = await fetch(buildUrl(readPath), { ...readOptions, headers: updateHeaders })
  const readText = await readResponse.text()
  let readBody
  try {
    readBody = readText ? JSON.parse(readText) : null
  } catch {
    readBody = { code: readResponse.status, message: readText || readResponse.statusText, data: null }
  }
  if (readResponse.status === 401 || readBody?.code === 401) {
    deleteToken()
    const createError = new Error(readBody?.message || '未登录或登录已过期')
    createError.code = 401
    throw createError
  }
  return { response: readResponse, body: readBody }
}

export async function readJson(readPath, readOptions = {}) {
  const { body: readBody } = await requestApi(readPath, readOptions)
  if (readBody == null) throw new Error('空响应')
  if (readBody.code === 200) return readBody.data
  throw new Error(readBody.message || `请求失败 (${readBody.code})`)
}

export async function uploadForm(readPath, uploadBody) {
  return readJson(readPath, { method: 'POST', body: uploadBody })
}

export async function downloadFile(readPath) {
  const updateHeaders = new Headers()
  const readValue = readToken()
  if (readValue) updateHeaders.set('Fusion-Token', readValue)
  const readResponse = await fetch(buildUrl(readPath), { method: 'GET', headers: updateHeaders })
  if (readResponse.status === 401) {
    deleteToken()
    throw new Error('未登录或登录已过期')
  }
  if (!readResponse.ok) throw new Error(`下载失败 (${readResponse.status})`)
  return readResponse.blob()
}
