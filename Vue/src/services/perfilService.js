import client from '@/api.js'

const salvarPerfil = (perfil) => {
  if (perfil?.id_perfil !== undefined) {
    const id = perfil.id_perfil
    const payload = JSON.stringify(perfil)
    return client.put(`/perfil/${id}`, payload).catch(e => e.response)
  } else {
    const payload = JSON.stringify(perfil)
    return client.post('/perfil', payload).catch(e => e.response)
  }
}

export const perfilService = {
  salvarPerfil
}
