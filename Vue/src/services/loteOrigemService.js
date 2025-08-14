import client from '@/api.js'

const salvarLote = (lote_origem) => {
  if (lote_origem?.id_lote_origem !== undefined) {
    const id = lote_origem.id_lote_origem
    const payload = JSON.stringify(lote_origem)
    return client.put(`/lote_origem/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(lote_origem)
    return client.post('/lote_origem', payload).catch(e => e.response)
  }
}

export const loteOrigemService = {
  salvarLote
}
