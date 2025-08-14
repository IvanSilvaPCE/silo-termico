import client from '@/api.js'

const salvarTipoAlarme = (tipo_alarme) => {
  if (tipo_alarme?.id_tipo_alarme !== undefined) {
    const id = tipo_alarme.id_tipo_alarme
    const payload = JSON.stringify(tipo_alarme)
    return client.put(`/tipo_alarme/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(tipo_alarme)
    return client.post('/tipo_alarme', payload).catch(e => e.response)
  }
}

export const tipoAlarmeService = {
  salvarTipoAlarme
}
