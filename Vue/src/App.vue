<template>
  <div class="d-flex flex-column" style="min-height: 100vh">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-0 sticky-top">
      <div class="container-fluid px-2 px-md-4">
        <span class="navbar-brand fs-6 fs-md-5 me-2">Sistema de Monitoramento</span>
        <button
          class="navbar-toggler border-0 p-1"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <div class="navbar-nav ms-auto d-flex flex-column flex-lg-row gap-1 mt-2 mt-lg-0">
            <button
              class="btn btn-sm"
              :class="telaAtiva === 'modelador' ? 'btn-light' : 'btn-outline-light'"
              @click="navegarPara('modelador')"
            >Modelador SVG</button>
            <button
              class="btn btn-sm"
              :class="telaAtiva === 'silo' ? 'btn-light' : 'btn-outline-light'"
              @click="navegarPara('silo')"
            >Silo 2D</button>
            <button
              class="btn btn-sm"
              :class="telaAtiva === 'silo3d' ? 'btn-light' : 'btn-outline-light'"
              @click="navegarPara('silo3d')"
            >Silo 3D</button>
            <button
              class="btn btn-sm"
              :class="telaAtiva === 'armazem' ? 'btn-light' : 'btn-outline-light'"
              @click="navegarPara('armazem')"
            >Armazem 2D</button>
            <button
              class="btn btn-sm"
              :class="telaAtiva === 'armazem3d' ? 'btn-light' : 'btn-outline-light'"
              @click="navegarPara('armazem3d')"
            >Armazem 3D</button>
          </div>
        </div>
      </div>
    </nav>

    <main class="flex-grow-1 overflow-hidden">
      <component
        :is="componenteAtivo"
        :dados="componenteDados"
      />
    </main>
  </div>
</template>

<script>
import ModeladorSVG from "./components/ModeladorSVG.vue";
import SiloSVG from "./components/Silo.vue";
import Silo3D from "./components/Silo3D.vue";
import ArmazemSVG from "./components/Armazem.vue";
import Armazem3D from "./components/Armazem3D.vue";
import dadosSimulados from "./dados";
import dadosSimuladosSilo from "./dadosSilo";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default {
  name: "App",
  components: {
    ModeladorSVG,
    SiloSVG,
    Silo3D,
    ArmazemSVG,
    Armazem3D,
  },
  data() {
    return {
      dados: null,
      dadosArm: null,
      dadosSilo: null,
      telaAtiva: "modelador",
    };
  },
  computed: {
    componenteAtivo() {
      switch (this.telaAtiva) {
        case "modelador":
          return "ModeladorSVG";
        case "silo":
          return "SiloSVG";
        case "silo3d":
          return "Silo3D";
        case "armazem":
          return "ArmazemSVG";
        case "armazem3d":
          return "Armazem3D";
        default:
          return "ModeladorSVG";
      }
    },
    componenteDados() {
      if (this.telaAtiva === "silo" || this.telaAtiva === "silo3d") {
        return this.dadosSilo;
      }
      if (this.telaAtiva === "armazem") {
        return this.dadosArm;
      }
      return undefined;
    },
  },
  mounted() {
    this.dadosArm = dadosSimulados;
    this.dadosSilo = dadosSimuladosSilo;
  },
  methods: {
    fecharMenuMobile() {
      const navbarCollapse = document.getElementById("navbarNav");
      if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        const navbarToggler = document.querySelector(".navbar-toggler");
        if (navbarToggler && window.bootstrap) {
          const bsCollapse = new window.bootstrap.Collapse(navbarCollapse, {
            toggle: false,
          });
          bsCollapse.hide();
        } else {
          navbarCollapse.classList.remove("show");
        }
      }
    },
    navegarPara(tela) {
      this.telaAtiva = tela;
      this.fecharMenuMobile();
    },
  },
};
</script>
