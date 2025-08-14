import client from '@/api.js'

const salvarProduto = (produto) => {
  const formData = new FormData()
  
  for (const campo in produto) {
    if (Object.prototype.hasOwnProperty.call(produto, campo)) {
      formData.append(campo, produto[campo]);
    }
  }

  if (produto?.id_produto !== undefined) {
    const id = produto.id_produto
    formData.append('_method', 'PUT')
    return client.post(`/produto/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data', }, }).catch((e) => e.response)
  } else {
    return client.post('/produto', formData, { headers: { 'Content-Type': 'multipart/form-data', }, }).catch((e) => e.response)
  }
}

export const produtoService = {
  salvarProduto
}
