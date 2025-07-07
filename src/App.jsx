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
  const [telaAtiva, setTelaAtiva] = useState("modelador"); // "modelador", "silo", "armazem"

  useEffect(() => {
    setDadosArm(dadosSimulados);
    setDadosSilo(dadosSimuladosSilo);
  }, []);

  // useEffect(() => {
  //   // fetch("http://172.16.1.85:3333/termometria/151/-1") // produza grande
  //   // fetch("http://172.16.1.85:3333/termometria/101/-1")  // " Global "
  //   fetch("http://172.16.1.85:3333/termometria/101/962")  // " Global "
  //   // fetch("http://172.16.1.85:3333/termometria/140/-1")  // " Produza Silo 4 "
  //     // fetch("http://172.16.1.85:3333/termometria/142/-1")  // " Produza Silo 5 "
  //     // fetch("http://172.16.1.85:3333/termometria/101/-1") // Silo Local
  //     // fetch("http://172.16.1.85:3333/termometria/101/623") // Produza
  //     .then((resp) => resp.json())
  //     .then((data) => setDados(data))
  //     .catch((err) => console.error(err));
  // }, []);

  // if (!dados) return <div>Carregando...</div>;

  const renderNavegacao = () => (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-0">
      <div className="container-fluid px-4">
        <span className="navbar-brand">Sistema de Monitoramento</span>
        <div className="navbar-nav d-flex flex-wrap">
          <button 
            className={`btn ${telaAtiva === "modelador" ? "btn-light" : "btn-outline-light"} me-1 mb-1`}
            onClick={() => setTelaAtiva("modelador")}
          >
            Modelador SVG
          </button>
          <button 
            className={`btn ${telaAtiva === "silo" ? "btn-light" : "btn-outline-light"} me-1 mb-1`}
            onClick={() => setTelaAtiva("silo")}
          >
            Silo 2D
          </button>
          <button 
            className={`btn ${telaAtiva === "silo3d" ? "btn-light" : "btn-outline-light"} me-1 mb-1`}
            onClick={() => setTelaAtiva("silo3d")}
          >
            Silo 3D
          </button>
          <button 
            className={`btn ${telaAtiva === "armazem" ? "btn-light" : "btn-outline-light"} me-1 mb-1`}
            onClick={() => setTelaAtiva("armazem")}
          >
            Armazém 2D
          </button>
          <button 
            className={`btn ${telaAtiva === "armazem3d" ? "btn-light" : "btn-outline-light"} mb-1`}
            onClick={() => setTelaAtiva("armazem3d")}
          >
            Armazém 3D
          </button>
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
    <div style={{ width: '100%', minHeight: '100vh' }}>
      {renderNavegacao()}
      <div style={{ width: '100%' }}>
        {renderConteudo()}
      </div>
    </div>
  );
};

export default App;
