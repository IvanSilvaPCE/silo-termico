import client from '@/api.js'

const salvarManualArquivo = (manual) => {
  const formData = new FormData()

  for (const campo in manual) {
    if (Object.prototype.hasOwnProperty.call(manual, campo)) {
      formData.append(campo, manual[campo]);
    }
  }

  return client.post('/manual_arquivo', formData, { headers: { 'Content-Type': 'multipart/form-data', }, }).catch((e) => e.response)
}

export const manualArquivoService = {
  salvarManualArquivo
}
