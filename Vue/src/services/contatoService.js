import client from '@/api.js'

const salvarContato = (contato) => {
  if (contato?.id_contato !== undefined) {
    const id = contato.id_contato
    const payload = JSON.stringify(contato)
    return client.put(`/contato/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(contato)
    return client.post('/contato', payload).catch(e => e.response)
  }
}

export const contatoService = {
  salvarContato
}
