import client from '@/api.js'

const salvarUsuario = (usuario) => {
  const formData = new FormData()

  for (const campo in usuario) {
    if (Object.prototype.hasOwnProperty.call(usuario, campo)) {
      formData.append(campo, usuario[campo])
    }
  }

  if (usuario?.id_usuario !== undefined) {
    const id = usuario.id_usuario
    formData.append('_method', 'PUT')
    return client.post(`/usuario/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data', }, }).catch((e) => e.response)
  } else {
    return client.post('/usuario', formData, { headers: { 'Content-Type': 'multipart/form-data', }, }).catch((e) => e.response)
  }
}

const salvarPerfil = (usuario) => {
  const formData = new FormData()

  for (const campo in usuario) {
    if (Object.prototype.hasOwnProperty.call(usuario, campo)) {
      formData.append(campo, usuario[campo])
    }
  }

  if (usuario?.id_usuario !== undefined) {
    const id = usuario.id_usuario
    formData.append('_method', 'PUT')
    return client.post(`/usuario/perfil/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data', }, }).catch((e) => e.response)
  }
}

export const usuarioService = {
  salvarUsuario,
  salvarPerfil
}
