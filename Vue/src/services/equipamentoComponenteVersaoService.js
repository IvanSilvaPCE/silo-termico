import client from '@/api.js'

const salvarComponenteVersao = (versao) => {
  if (versao?.id_versao !== undefined) {
    const id = versao.id_versao
    const payload = JSON.stringify(versao)
    return client.put(`/versao/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(versao)
    return client.post('/versao', payload).catch(e => e.response)
  }
}

export const equipamentoComponenteVersaoService = {
  salvarComponenteVersao
}
