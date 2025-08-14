import client from '@/api.js'

const salvarManual = (manual) => {
  if (manual?.id_manual !== undefined) {
    const id = manual.id_manual
    const payload = JSON.stringify(manual)
    return client.put(`/manual/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(manual)
    return client.post('/manual', payload).catch(e => e.response)
  }
}

export const manualService = {
  salvarManual
}
