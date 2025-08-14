import client from '@/api.js'

const salvarPais = (pais) => {
  if (pais?.id_pais !== undefined) {
    const id = pais.id_pais
    const payload = JSON.stringify(pais)
    return client.put(`/pais/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(pais)
    return client.post('/pais', payload).catch(e => e.response)
  }
}

export const paisService = {
  salvarPais
}
