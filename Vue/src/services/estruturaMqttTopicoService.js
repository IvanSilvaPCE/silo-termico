import client from '@/api.js'

const salvarEstruturaMqttTopico = (estrutura_mqtt_topico) => {
  if (estrutura_mqtt_topico?.id_estrutura_mqtt_topico !== undefined) {
    const id = estrutura_mqtt_topico.id_estrutura_mqtt_topico
    const payload = JSON.stringify(estrutura_mqtt_topico)
    return client.put(`/estrutura_mqtt_topico/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(estrutura_mqtt_topico)
    return client.post('/estrutura_mqtt_topico', payload).catch(e => e.response)
  }
}

const salvarEstruturaMqttTopicoAtu = (estrutura_mqtt_topico_atu) => {
  const payload = JSON.stringify(estrutura_mqtt_topico_atu)
  return client.post('/estrutura_mqtt_topico_atu', payload).catch(e => e.response)
}

export const estruturaMqttTopicoService = {
  salvarEstruturaMqttTopico,
  salvarEstruturaMqttTopicoAtu
}
