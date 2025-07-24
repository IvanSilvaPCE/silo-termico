<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#">Sistema Silo Térmico</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item :to="{ name: 'ModeladorSVG' }">Modelador SVG</b-nav-item>
          <b-nav-item :to="{ name: 'Silo2D' }">Silo 2D</b-nav-item>
          <b-nav-item :to="{ name: 'Silo3D' }">Silo 3D</b-nav-item>
          <b-nav-item :to="{ name: 'Armazem2D' }">Armazém 2D</b-nav-item>
          <b-nav-item :to="{ name: 'Armazem3D' }">Armazém 3D</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

main {
  margin-top: 20px;
}
</style>