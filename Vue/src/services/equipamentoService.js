import client from '@/api.js'

const salvarEquipamento = (equipamento) => {
  if (equipamento?.id_equipamento !== undefined) {
    const id = equipamento.id_equipamento
    const payload = JSON.stringify(equipamento)
    return client.put(`/equipamento/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(equipamento)
    return client.post('/equipamento', payload).catch(e => e.response)
  }
}

export const equipamentoService = {
  salvarEquipamento
}
