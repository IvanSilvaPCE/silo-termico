import client from '@/api.js'

const salvarConexao = (conexao) => {
  if (conexao?.id_conexao !== undefined) {
    const id = conexao.id_conexao
    const payload = JSON.stringify(conexao)
    return client.put(`/conexao/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(conexao)
    return client.post('/conexao', payload).catch(e => e.response)
  }
}

export const conexaoService = {
  salvarConexao
}
