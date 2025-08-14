import client from '@/api.js'

const salvarEstruturaMqttAtu = (estrutura_mqtt_atu) => {
  if (estrutura_mqtt_atu?.id_estrutura_mqtt_atu !== undefined) {
    const id = estrutura_mqtt_atu.id_estrutura_mqtt_atu
    const payload = JSON.stringify(estrutura_mqtt_atu)
    return client.put(`/estrutura_mqtt_atu/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(estrutura_mqtt_atu)
    return client.post('/estrutura_mqtt_atu', payload).catch(e => e.response)
  }
}

export const estruturaMqttAtuService = {
  salvarEstruturaMqttAtu
}
