<template>
  <div class="mb-3">
    <label class="form-label fw-bold" style="color: #06335E;">Visão:</label>
    <select class="form-select" :value="value" @input="$emit('input', $event.target.value)">
      <option value="lateral">Lateral</option>
      <option value="topo">Topo</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'SeletorVisao',
  props: {
    value: String
  }
}
</script>
