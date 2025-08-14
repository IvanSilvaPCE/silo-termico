import client from '@/api.js'

const salvarCidade = (cidade) => {
  if (cidade?.id_cidade !== undefined) {
    const id = cidade.id_cidade
    const payload = JSON.stringify(cidade)
    return client.put(`/cidade/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(cidade)
    return client.post('/cidade', payload).catch(e => e.response)
  }
}

export const cidadeService = {
  salvarCidade
}
