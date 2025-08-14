import client from '@/api.js'

const salvarCategoria = (categoria_manual) => {
  if (categoria_manual?.id_categoria_manual !== undefined) {
    const id = categoria_manual.id_categoria_manual
    const payload = JSON.stringify(categoria_manual)
    return client.put(`/categoria_manual/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(categoria_manual)
    return client.post('/categoria_manual', payload).catch(e => e.response)
  }
}

export const categoriaManualService = {
  salvarCategoria
}
