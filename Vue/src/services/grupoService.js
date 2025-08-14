import client from '@/api.js'

const salvarGrupo = (grupo_alarme) => {
  if (grupo_alarme?.id_grupo_alarme !== undefined) {
    const id = grupo_alarme.id_grupo_alarme
    const payload = JSON.stringify(grupo_alarme)
    return client.put(`/grupo_alarme/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(grupo_alarme)
    return client.post('/grupo_alarme', payload).catch(e => e.response)
  }
}

export const grupoService = {
  salvarGrupo
}
