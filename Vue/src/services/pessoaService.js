import client from '@/api.js'

const salvarPessoa = (pessoa) => {
  const formData = new FormData()

  for (const campo in pessoa) {
    if (Object.prototype.hasOwnProperty.call(pessoa, campo)) {
      formData.append(campo, pessoa[campo])
    }
  }

  if (pessoa?.id_pessoa !== undefined) {
    const id = pessoa.id_pessoa
    formData.append('_method', 'PUT')
    return client.post(`/pessoa/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data', }, }).catch((e) => e.response)
  } else {
    return client.post('/pessoa', formData, { headers: { 'Content-Type': 'multipart/form-data', }, }).catch((e) => e.response)
  }
}

export const pessoaService = {
  salvarPessoa
}
