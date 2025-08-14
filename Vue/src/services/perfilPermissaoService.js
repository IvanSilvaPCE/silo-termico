import client from '@/api.js'

const salvarPerfilPermissao = (perfil_permissao) => {
  const payload = JSON.stringify(perfil_permissao)
  return client.post('/perfil_permissao', payload).catch(e => e.response)
}

export const perfilPermissaoService = {
  salvarPerfilPermissao
}
