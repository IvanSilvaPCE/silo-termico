import client from '@/api.js'

const salvarUf = (uf) => {
  if (uf?.id_uf !== undefined) {
    const id = uf.id_uf
    const payload = JSON.stringify(uf)
    return client.put(`/uf/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(uf)
    return client.post('/uf', payload).catch(e => e.response)
  }
}

export const ufService = {
  salvarUf
}
