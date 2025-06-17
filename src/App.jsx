import React, { useState, useEffect } from "react";
import SiloSVG from "./components/Silo";
import ArmazemSVG from './components/Armazem';
import ModeladorSVG from './components/ModeladorSVG';
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
        <div className="navbar-nav">
          <button 
            className={`btn ${telaAtiva === "modelador" ? "btn-light" : "btn-outline-light"} me-2`}
            onClick={() => setTelaAtiva("modelador")}
          >
            Modelador SVG
          </button>
          <button 
            className={`btn ${telaAtiva === "silo" ? "btn-light" : "btn-outline-light"} me-2`}
            onClick={() => setTelaAtiva("silo")}
          >
            Silo
          </button>
          <button 
            className={`btn ${telaAtiva === "armazem" ? "btn-light" : "btn-outline-light"}`}
            onClick={() => setTelaAtiva("armazem")}
          >
            Armazém
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
      case "armazem":
        return <ArmazemSVG dados={dadosArm} />;
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
