
import React, { useState, useEffect } from "react";
import SiloSVG from "./components/Silo";
import ArmazemSVG from './components/Armazem';
import ModeladorSVG from './components/ModeladorSVG';
import Silo3D from './components/Silo3D';
import Armazem3D from './components/Armazem3D';
import dadosSimulados from "./dados";
import dadosSimuladosSilo from "./dadosSilo";

const App = () => {
  const [dados, setDados] = useState(null);
  const [dadosArm, setDadosArm] = useState(null);
  const [dadosSilo, setDadosSilo] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState("modelador");

  useEffect(() => {
    setDadosArm(dadosSimulados);
    setDadosSilo(dadosSimuladosSilo);
  }, []);

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
              onClick={() => setTelaAtiva("modelador")}
            >
              <span className="d-none d-sm-inline">Modelador </span>SVG
            </button>
            <button 
              className={`btn btn-sm ${telaAtiva === "silo" ? "btn-light" : "btn-outline-light"} mb-1 mb-lg-0`}
              onClick={() => setTelaAtiva("silo")}
            >
              Silo 2D
            </button>
            <button 
              className={`btn btn-sm ${telaAtiva === "silo3d" ? "btn-light" : "btn-outline-light"} mb-1 mb-lg-0`}
              onClick={() => setTelaAtiva("silo3d")}
            >
              Silo 3D
            </button>
            <button 
              className={`btn btn-sm ${telaAtiva === "armazem" ? "btn-light" : "btn-outline-light"} mb-1 mb-lg-0`}
              onClick={() => setTelaAtiva("armazem")}
            >
              <span className="d-none d-sm-inline">Armazém </span>2D
            </button>
            <button 
              className={`btn btn-sm ${telaAtiva === "armazem3d" ? "btn-light" : "btn-outline-light"} mb-1 mb-lg-0`}
              onClick={() => setTelaAtiva("armazem3d")}
            >
              <span className="d-none d-sm-inline">Armazém </span>3D
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
