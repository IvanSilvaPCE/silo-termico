import client from '@/api.js'

const salvarCategoria = (categoria_equipamento) => {
  if (categoria_equipamento?.id_categoria_equipamento !== undefined) {
    const id = categoria_equipamento.id_categoria_equipamento
    const payload = JSON.stringify(categoria_equipamento)
    return client.put(`/categoria_equipamento/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(categoria_equipamento)
    return client.post('/categoria_equipamento', payload).catch(e => e.response)
  }
}

export const categoriaService = {
  salvarCategoria
}
