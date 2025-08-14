import client from '@/api.js'

const salvarEstruturaMqtt = (estrutura_mqtt) => {
  if (estrutura_mqtt?.id_estrutura_mqtt !== undefined) {
    const id = estrutura_mqtt.id_estrutura_mqtt
    const payload = JSON.stringify(estrutura_mqtt)
    return client.put(`/estrutura_mqtt/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(estrutura_mqtt)
    return client.post('/estrutura_mqtt', payload).catch(e => e.response)
  }
}

export const estruturaMqttService = {
  salvarEstruturaMqtt
}
