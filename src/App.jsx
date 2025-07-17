
import React, { useState, useEffect } from "react";
import SiloSVG from "./components/Silo";
import ArmazemSVG from './components/Armazem';
import ModeladorSVG from './components/ModeladorSVG';
import Silo3D from './components/Silo3D';
import Armazem3D from './components/Armazem3D';
import dadosSimulados from "./dados";
import dadosSimuladosSilo from "./dadosSilo";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const App = () => {
  const [dados, setDados] = useState(null);
  const [dadosArm, setDadosArm] = useState(null);
  const [dadosSilo, setDadosSilo] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState("modelador");

  useEffect(() => {
    setDadosArm(dadosSimulados);
    setDadosSilo(dadosSimuladosSilo);
  }, []);

  // Função para fechar o menu mobile
  const fecharMenuMobile = () => {
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      // Método mais direto usando Bootstrap classes
      const navbarToggler = document.querySelector('.navbar-toggler');
      if (navbarToggler && window.bootstrap) {
        const bsCollapse = new window.bootstrap.Collapse(navbarCollapse, {
          toggle: false
        });
        bsCollapse.hide();
      } else {
        // Fallback manual se Bootstrap não estiver disponível
        navbarCollapse.classList.remove('show');
      }
    }
  };

  // Função para navegar e fechar menu
  const navegarPara = (tela) => {
    setTelaAtiva(tela);
    fecharMenuMobile();
  };

  const renderNavegacao = () => (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-0 sticky-top">
      <div className="container-fluid px-2 px-md-4">
        <span className="navbar-brand fs-6 fs-md-5 me-2">Sistema de Monitoramento</span>
        
        {/* Botão do menu mobile */}
        <button 
          className="navbar-toggler border-0 p-1" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu colapsável */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="navbar-nav ms-auto d-flex flex-column flex-lg-row gap-1 mt-2 mt-lg-0">
            <button 
              className={`btn btn-sm ${telaAtiva === "modelador" ? "btn-light" : "btn-outline-light"} mb-1 mb-lg-0`}
              onClick={() => navegarPara("modelador")}
            >
              Modelador SVG
            </button>
            <button 
              className={`btn btn-sm ${telaAtiva === "silo" ? "btn-light" : "btn-outline-light"} mb-1 mb-lg-0`}
              onClick={() => navegarPara("silo")}
            >
              Silo 2D
            </button>
            <button 
              className={`btn btn-sm ${telaAtiva === "silo3d" ? "btn-light" : "btn-outline-light"} mb-1 mb-lg-0`}
              onClick={() => navegarPara("silo3d")}
            >
              Silo 3D
            </button>
            <button 
              className={`btn btn-sm ${telaAtiva === "armazem" ? "btn-light" : "btn-outline-light"} mb-1 mb-lg-0`}
              onClick={() => navegarPara("armazem")}
            >
              Armazem 2D
            </button>
            <button 
              className={`btn btn-sm ${telaAtiva === "armazem3d" ? "btn-light" : "btn-outline-light"} mb-1 mb-lg-0`}
              onClick={() => navegarPara("armazem3d")}
            >
              Armazem 3D
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderConteudo = () => {
    switch(telaAtiva) {
      case "modelador":
        return <ModeladorSVG />;
      case "silo":
        return <SiloSVG dados={dadosSilo} />;
      case "silo3d":
        return <Silo3D dados={dadosSilo} />;
      case "armazem":
        return <ArmazemSVG dados={dadosArm} />;
      case "armazem3d":
        return <Armazem3D />;
      default:
        return <ModeladorSVG />;
    }
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      {renderNavegacao()}
      <main className="flex-grow-1 overflow-hidden">
        {renderConteudo()}
      </main>
    </div>
  );
};

export default App;
