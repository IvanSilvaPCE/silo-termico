import client from '@/api.js'

const salvarAlarme = (alarme) => {
  if (alarme?.id_alarme !== undefined) {
    const id = alarme.id_alarme
    const payload = JSON.stringify(alarme)
    return client.put(`/alarme/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(alarme)
    return client.post('/alarme', payload).catch(e => e.response)
  }
}

export const alarmeService = {
  salvarAlarme
}
