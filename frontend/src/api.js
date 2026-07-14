import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const client = axios.create({ baseURL: API_BASE })

export const generateEmail = (payload) =>
  client.post('/api/generate-email', payload).then((r) => r.data)

export const generateEmailBulk = (payload) =>
  client.post('/api/generate-email-bulk', payload).then((r) => r.data)

export const sendBulkEmail = (payload) =>
  client.post('/api/send-bulk-email', payload).then((r) => r.data)

export const aiProcess = (action, text, target_language) =>
  client.post('/api/ai/process', { action, text, target_language }).then((r) => r.data)

export const summarizeInbox = (email_text) =>
  client.post('/api/summarize-inbox', { email_text }).then((r) => r.data)

export const getTemplates = () =>
  client.get('/api/templates').then((r) => r.data)

export const createTemplate = (payload) =>
  client.post('/api/templates', payload).then((r) => r.data)

export const getHistory = (user_id = 'guest') =>
  client.get('/api/history', { params: { user_id } }).then((r) => r.data)

export const saveHistory = (payload) =>
  client.post('/api/history', payload).then((r) => r.data)

export const deleteHistory = (id) =>
  client.delete(`/api/history/${id}`).then((r) => r.data)

export const exportEmail = async (subject, body, format) => {
  const res = await client.post(
    '/api/export',
    { subject, body, format },
    { responseType: 'blob' }
  )
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${subject || 'email'}.${format}`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export default client
