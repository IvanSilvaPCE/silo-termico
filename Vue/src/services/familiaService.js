import client from '@/api.js'

const salvarFamilia = (familia) => {
  if (familia?.id_familia !== undefined) {
    const id = familia.id_familia
    const payload = JSON.stringify(familia)
    return client.put(`/familia/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(familia)
    return client.post('/familia', payload).catch(e => e.response)
  }
}

export const familiaService = {
  salvarFamilia
}
