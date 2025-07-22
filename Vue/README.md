
# Sistema de Monitoramento Silo Térmico - Vue

Sistema convertido para Vue 2 com Bootstrap Vue para monitoramento de silos e armazéns.

## Tecnologias Utilizadas

- Vue 2.6.14
- Bootstrap 4.6.1
- Bootstrap Vue 2.23.1
- Vue Router 3.5.1
- Vuex 3.6.2
- Vue Select 3.20.2
- V-Mask 2.3.0
- Axios 1.5.0
- D3.js 7.9.0
- Leaflet 1.9.4
- Three.js 0.178.0

## Instalação

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run serve

# Build para produção
npm run build
```

## Estrutura do Projeto

```
Vue/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ModeladorSVG.vue
│   │   ├── Silo2D.vue
│   │   ├── Silo3D.vue
│   │   ├── Armazem2D.vue
│   │   └── Armazem3D.vue
│   ├── router/
│   │   └── index.js
│   ├── store/
│   │   └── index.js
│   ├── App.vue
│   └── main.js
├── vue.config.js
└── package.json
```

## Funcionalidades

### Modelador SVG
- Configuração de dimensões do silo
- Controle de aeradores
- Preview em tempo real
- Salvamento de modelos

### Silo 2D
- Visualização de temperatura
- Mapa de calor
- Configuração de grade

### Silo 3D
- Visualização tridimensional (em desenvolvimento)
- Controles de parâmetros

### Armazém 2D
- Monitoramento por setores
- Mapa de temperatura
- Configuração dinâmica

### Armazém 3D
- Visualização 3D do armazém (em desenvolvimento)
- Controle de nível de grãos

## Desenvolvimento

O projeto roda na porta 5000 por padrão e está configurado para aceitar conexões externas (host: 0.0.0.0).

## Status

- ✅ Estrutura base do Vue
- ✅ Componentização
- ✅ Bootstrap Vue integrado
- ✅ ModeladorSVG funcional
- ✅ Silo2D funcional
- ✅ Armazem2D funcional
- 🔄 Three.js (em desenvolvimento)
- 🔄 Integração com APIs
