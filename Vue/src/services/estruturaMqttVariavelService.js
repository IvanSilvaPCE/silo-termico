import client from '@/api.js'

const salvarEstruturaMqttVariavel = (estrutura_mqtt_variavel) => {
  if (estrutura_mqtt_variavel?.id_estrutura_mqtt_variavel !== undefined) {
    const id = estrutura_mqtt_variavel.id_estrutura_mqtt_variavel
    const payload = JSON.stringify(estrutura_mqtt_variavel)
    return client.put(`/estrutura_mqtt_variavel/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(estrutura_mqtt_variavel)
    return client.post('/estrutura_mqtt_variavel', payload).catch(e => e.response)
  }
}

export const estruturaMqttVariavelService = {
  salvarEstruturaMqttVariavel
}
