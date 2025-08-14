import client from '@/api.js'

const salvarLote = (lote_destino) => {
  if (lote_destino?.id_lote_destino !== undefined) {
    const id = lote_destino.id_lote_destino
    const payload = JSON.stringify(lote_destino)
    return client.put(`/lote_destino/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(lote_destino)
    return client.post('/lote_destino', payload).catch(e => e.response)
  }
}

export const loteDestinoService = {
  salvarLote
}
