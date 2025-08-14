import client from '@/api.js'

const salvarTransacaoOperacao = (transacao_operacao) => {
  if (transacao_operacao?.id_transacao_operacao !== undefined) {
    const id = transacao_operacao.id_transacao_operacao
    const payload = JSON.stringify(transacao_operacao)
    return client.put(`/transacao_operacao/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(transacao_operacao)
    return client.post('/transacao_operacao', payload).catch(e => e.response)
  }
}

export const transacaoOperacaoService = {
  salvarTransacaoOperacao
}
