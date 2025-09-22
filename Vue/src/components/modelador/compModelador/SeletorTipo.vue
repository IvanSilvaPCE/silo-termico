<template>
  <div class="mb-3">
    <label class="form-label fw-bold" style="color: #06335E;">Tipo de Estrutura:</label>
    <select class="form-select" :value="value" @input="$emit('input', $event.target.value)">
      <option value="silo">Silo</option>
      <option value="armazem">Armazém</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'SeletorTipo',
  props: {
    value: String
  }
}
</script>