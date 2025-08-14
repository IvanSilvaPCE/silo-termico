import client from '@/api.js'

const salvarProdutoComponente = (produto_componente) => {
  const payload = JSON.stringify(produto_componente)
  return client.post('/produto_componente', payload).catch(e => e.response)
}

export const produtoComponenteService = {
  salvarProdutoComponente
}
