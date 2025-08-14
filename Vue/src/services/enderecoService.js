import client from '@/api.js'

const salvarEndereco = (endereco) => {
  if (endereco?.id_endereco !== undefined) {
    const id = endereco.id_endereco
    const payload = JSON.stringify(endereco)
    return client.put(`/endereco/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(endereco)
    return client.post('/endereco', payload).catch(e => e.response)
  }
}

export const enderecoService = {
  salvarEndereco
}
