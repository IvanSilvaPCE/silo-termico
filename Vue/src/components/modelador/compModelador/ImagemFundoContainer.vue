<template>
  <div 
    v-if="imagemFundoData.url"
    class="position-absolute d-flex align-items-center justify-content-center"
    :style="{
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: 1,
      overflow: 'hidden',
      borderRadius: '4px'
    }"
  >
    <img
      :src="imagemFundoData.url"
      :style="{
        position: 'relative',
        left: imagemFundoData.x + 'px',
        top: imagemFundoData.y + 'px',
        transform: `scale(${imagemFundoData.scale})`,
        transformOrigin: 'center center',
        opacity: imagemFundoData.opacity,
        maxWidth: 'none',
        maxHeight: 'none',
        userSelect: 'none',
        pointerEvents: 'none',
        transition: 'all 0.3s ease-in-out'
      }"
      alt="Imagem de fundo"
    />
  </div>
</template>

<script>
export default {
  name: 'ImagemFundoContainer',
  props: {
    imagemFundoData: {
      type: Object,
      required: true,
      default: () => ({
        url: '',
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1
      })
    }
  }
}
</script>