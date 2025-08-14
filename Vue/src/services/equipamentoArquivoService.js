import client from '@/api.js'

const salvarEquipamentoArquivo = (equipamento) => {
  const formData = new FormData()

  for (const campo in equipamento) {
    if (Object.prototype.hasOwnProperty.call(equipamento, campo)) {
      formData.append(campo, equipamento[campo]);
    }
  }

  return client.post('/equipamento_arquivo', formData, { headers: { 'Content-Type': 'multipart/form-data', }, }).catch((e) => e.response)
}

export const equipamentoArquivoService = {
  salvarEquipamentoArquivo
}
