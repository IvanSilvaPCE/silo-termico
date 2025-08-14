import client from '@/api.js'

const salvarTransacao = (transacao) => {
  if (transacao?.id_transacao !== undefined) {
    const id = transacao.id_transacao
    const payload = JSON.stringify(transacao)
    return client.put(`/transacao/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(transacao)
    return client.post('/transacao', payload).catch(e => e.response)
  }
}

export const transacaoService = {
  salvarTransacao
}
