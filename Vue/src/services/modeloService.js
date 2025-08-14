import client from '@/api.js'

const salvarModelo = (modelo_componente) => {
  if (modelo_componente?.id_modelo_componente !== undefined) {
    const id = modelo_componente.id_modelo_componente
    const payload = JSON.stringify(modelo_componente)
    return client.put(`/modelo_componente/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(modelo_componente)
    return client.post('/modelo_componente', payload).catch(e => e.response)
  }
}

export const modeloService = {
  salvarModelo
}
