import { deleteToken, readJson, readToken, saveToken } from '@/lib/api'

let readUserCache = null

export function consumeToken() {
  const updateUrl = new URL(window.location.href)
  let readValue = updateUrl.searchParams.get('token')
  if (readValue) updateUrl.searchParams.delete('token')

  const readIndex = updateUrl.hash.indexOf('?')
  if (!readValue && readIndex !== -1) {
    const readParams = new URLSearchParams(updateUrl.hash.slice(readIndex + 1))
    readValue = readParams.get('token')
    if (readValue) {
      readParams.delete('token')
      const readPath = updateUrl.hash.slice(0, readIndex)
      const readQuery = readParams.toString()
      updateUrl.hash = readPath + (readQuery ? `?${readQuery}` : '')
    }
  }
  if (!readValue) return false

  saveToken(readValue)
  const readQuery = updateUrl.searchParams.toString()
  window.history.replaceState({}, '', updateUrl.pathname
    + (readQuery ? `?${readQuery}` : '') + updateUrl.hash)
  return true
}

export async function readUser(readRefresh = false) {
  if (!readToken()) return null
  if (!readRefresh && readUserCache) return readUserCache
  readUserCache = await readJson('/user/me')
  return readUserCache
}

export function loginUser() {
  window.location.assign('/fudan/login')
}

export async function logoutUser() {
  let readUrl = ''
  try {
    const readResult = await readJson('/fudan/logout', { method: 'POST' })
    readUrl = readResult?.redirectUrl || ''
  } finally {
    readUserCache = null
    deleteToken()
  }
  if (readUrl) window.location.assign(readUrl)
  else window.location.hash = '#/login'
}
