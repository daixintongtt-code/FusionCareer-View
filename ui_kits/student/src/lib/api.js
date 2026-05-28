/**
 * 与网关约定：浏览器请求 /api/**，开发环境 Vite 代理去掉 /api 前缀转发到 Java（与生产 Nginx 一致）。
 * 鉴权：Sa-Token header 名 Fusion-Token（见后端 application.yml）。
 */

const TOKEN_STORAGE_KEY = 'fusion-career-token'

/** 对外请求前缀（含 /api） */
export function getApiPrefix() {
  const base = import.meta.env.VITE_API_BASE
  if (base != null && String(base).trim() !== '') return String(base).replace(/\/$/, '')
  return '/api'
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch { /* ignore */ }
}

export function clearToken() {
  setToken('')
}

/**
 * 注销服务端会话（Sa-Token），再清除本地 token。
 * GET /fudan/logout 需在请求头携带 Fusion-Token，否则后端无法识别当前登录态。
 */
export async function logoutSession() {
  const token = getToken()
  try {
    const headers = new Headers()
    if (token) headers.set('Fusion-Token', token)
    await fetch('/fudan/logout', { method: 'GET', headers, redirect: 'manual' })
  } catch {
    /* 仍清除本地，避免卡在半登录态 */
  } finally {
    clearToken()
  }
}

/**
 * 从 URL 读取 SSO 回跳 token 并持久化，再从地址栏移除（避免刷新泄露/重复）。
 * 支持 `?token=` 在 hash 之前，或 `#/path?token=`。
 */
export function consumeUrlToken() {
  const href = window.location.href
  const url = new URL(href)

  const searchToken = url.searchParams.get('token')
  if (searchToken) {
    setToken(searchToken)
    url.searchParams.delete('token')
    const qs = url.searchParams.toString()
    const next = url.pathname + (qs ? `?${qs}` : '') + url.hash
    window.history.replaceState({}, '', next)
    return true
  }

  const hash = url.hash
  const qm = hash.indexOf('?')
  if (qm === -1) return false
  const pathPart = hash.slice(0, qm)
  const qsPart = hash.slice(qm + 1)
  const hp = new URLSearchParams(qsPart)
  const ht = hp.get('token')
  if (!ht) return false
  setToken(ht)
  hp.delete('token')
  const rest = hp.toString()
  url.hash = pathPart + (rest ? `?${rest}` : '')
  window.history.replaceState({}, '', url.pathname + url.search + url.hash)
  return true
}

function buildUrl(path) {
  const prefix = getApiPrefix()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${prefix}${p}`
}

/**
 * @param {string} path 不含 /api 前缀，如 `/job/list?page=1`
 * @param {RequestInit} options
 */
export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = getToken()
  if (token) headers.set('Fusion-Token', token)
  if (options.body != null && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(buildUrl(path), { ...options, headers })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { code: res.status, message: text || res.statusText, data: null }
  }
  if (res.status === 401 || data?.code === 401) {
    clearToken()
    const err = new Error(data?.message || '未登录或登录已过期')
    err.code = 401
    throw err
  }
  return { res, data }
}

/** 解析统一 R 包装；成功返回 data，失败 throw Error(message) */
export function unwrapR(data) {
  if (data == null) throw new Error('空响应')
  if (data.code === 200) return data.data
  throw new Error(data.message || `请求失败 (${data.code})`)
}

export async function apiJson(path, options = {}) {
  const { data } = await apiFetch(path, options)
  return unwrapR(data)
}

/** multipart POST，不要设置 Content-Type（浏览器自动带 boundary） */
export async function apiForm(path, formData) {
  const { data } = await apiFetch(path, { method: 'POST', body: formData })
  return unwrapR(data)
}

/** 带 Fusion-Token 下载二进制（简历文件等） */
export async function apiDownloadBlob(path) {
  const headers = new Headers()
  const token = getToken()
  if (token) headers.set('Fusion-Token', token)
  const res = await fetch(buildUrl(path), { method: 'GET', headers })
  if (res.status === 401) {
    clearToken()
    throw new Error('未登录或登录已过期')
  }
  if (!res.ok) throw new Error(`下载失败 (${res.status})`)
  return res.blob()
}
