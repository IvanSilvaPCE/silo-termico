import client from '@/api.js'

const salvarRisco = (risco) => {
  if (risco?.id_risco !== undefined) {
    const id = risco.id_risco
    const payload = JSON.stringify(risco)
    return client.put(`/risco/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(risco)
    return client.post('/risco', payload).catch(e => e.response)
  }
}

export const riscoService = {
  salvarRisco
}
