import client from '@/api.js'

const salvarUsuarioPerfil = (usuario_perfil) => {
  const payload = JSON.stringify(usuario_perfil)
  return client.post('/usuario_perfil', payload).catch(e => e.response)
}

export const usuarioPerfilService = {
  salvarUsuarioPerfil
}
