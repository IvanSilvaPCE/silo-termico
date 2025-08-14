import client from '@/api.js'

const salvarSubfamilia = (subfamilia) => {
  if (subfamilia?.id_subfamilia !== undefined) {
    const id = subfamilia.id_subfamilia
    const payload = JSON.stringify(subfamilia)
    return client.put(`/subfamilia/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(subfamilia)
    return client.post('/subfamilia', payload).catch(e => e.response)
  }
}

export const subfamiliaService = {
  salvarSubfamilia
}
