import client from '@/api.js'

const salvarCausa = (causa) => {
  if (causa?.id_causa !== undefined) {
    const id = causa.id_causa
    const payload = JSON.stringify(causa)
    return client.put(`/causa/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(causa)
    return client.post('/causa', payload).catch(e => e.response)
  }
}

export const causaService = {
  salvarCausa
}
