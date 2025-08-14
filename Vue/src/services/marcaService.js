import client from '@/api.js'

const salvarMarca = (marca) => {
  if (marca?.id_marca !== undefined) {
    const id = marca.id_marca
    const payload = JSON.stringify(marca)
    return client.put(`/marca/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(marca)
    return client.post('/marca', payload).catch(e => e.response)
  }
}

export const marcaService = {
  salvarMarca
}
