import client from '@/api.js'

const salvarProdutoAlarme = (produto_alarme) => {
  const payload = JSON.stringify(produto_alarme)
  return client.post('/produto_alarme', payload).catch(e => e.response)
}

export const produtoAlarmeService = {
  salvarProdutoAlarme
}
