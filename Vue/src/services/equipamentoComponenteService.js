import client from '@/api.js'

const salvarEquipamentoComponente = (equipamento_componente) => {
  if (equipamento_componente?.id_equipamento_componente !== undefined) {
    const id = equipamento_componente.id_equipamento_componente
    const payload = JSON.stringify(equipamento_componente)
    return client.put(`/equipamento_componente/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(equipamento_componente)
    return client.post('/equipamento_componente', payload).catch(e => e.response)
  }
}

export const equipamentoComponenteService = {
  salvarEquipamentoComponente
}
