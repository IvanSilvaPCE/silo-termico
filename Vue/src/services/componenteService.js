import client from '@/api.js'

const salvarComponente = (componente) => {
  const formData = new FormData()
  
  for (const campo in componente) {
    if (Object.prototype.hasOwnProperty.call(componente, campo)) {
      formData.append(campo, componente[campo]);
    }
  }

  if (componente?.id_componente !== undefined) {
    const id = componente.id_componente
    formData.append('_method', 'PUT')
    return client.post(`/componente/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data', }, }).catch((e) => e.response)
  } else {
    return client.post('/componente', formData, { headers: { 'Content-Type': 'multipart/form-data', }, }).catch((e) => e.response)
  }
}

export const componenteService = {
  salvarComponente
}
