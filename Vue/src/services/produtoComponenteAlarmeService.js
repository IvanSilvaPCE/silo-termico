import client from '@/api.js'

const salvarComponenteAlarme = (produto_componente_alarme) => {
  const payload = JSON.stringify(produto_componente_alarme)
  return client.post('/produto_componente_alarme', payload).catch(e => e.response)
}

export const produtoComponenteAlarmeService = {
  salvarComponenteAlarme
}
