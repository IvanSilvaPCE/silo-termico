import client from '@/api.js'

const salvarEstruturaPessoa = (estrutura_pessoa) => {
  if (estrutura_pessoa?.id_estrutura_pessoa !== undefined) {
    const id = estrutura_pessoa.id_estrutura_pessoa
    const payload = JSON.stringify(estrutura_pessoa)
    return client.put(`/estrutura_pessoa/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(estrutura_pessoa)
    return client.post('/estrutura_pessoa', payload).catch(e => e.response)
  }
}

export const estruturaPessoaService = {
  salvarEstruturaPessoa
}
