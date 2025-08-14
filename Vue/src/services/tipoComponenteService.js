import client from '@/api.js'

const salvarTipoComponente = (tipo_componente) => {
  if (tipo_componente?.id_tipo_componente !== undefined) {
    const id = tipo_componente.id_tipo_componente
    const payload = JSON.stringify(tipo_componente)
    return client.put(`/tipo_componente/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(tipo_componente)
    return client.post('/tipo_componente', payload).catch(e => e.response)
  }
}

export const tipoComponenteService = {
  salvarTipoComponente
}
