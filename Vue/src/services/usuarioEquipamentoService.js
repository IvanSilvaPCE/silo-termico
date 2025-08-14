import client from '@/api.js'

const salvarUsuarioEquipamento = (usuario_equipamento) => {
  const payload = JSON.stringify(usuario_equipamento)
  return client.post('/usuario_equipamento', payload).catch(e => e.response)
}

export const usuarioEquipamentoService = {
  salvarUsuarioEquipamento
}
