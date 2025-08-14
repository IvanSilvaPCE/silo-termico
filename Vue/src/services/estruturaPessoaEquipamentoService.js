import client from '@/api.js'

const salvarEstruturaPessoaEquipamento = (estrutura_pessoa_equipamento) => {
  const payload = JSON.stringify(estrutura_pessoa_equipamento)
  return client.post('/estrutura_pessoa_equipamento', payload).catch(e => e.response)
}

export const estruturaPessoaEquipamentoService = {
  salvarEstruturaPessoaEquipamento
}
