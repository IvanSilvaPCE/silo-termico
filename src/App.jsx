import React, { useState, useEffect } from "react";
import SiloSVG from "./components/Silo";
import ArmazemSVG from './components/Armazem';
import dadosSimulados from "./dados";

const App = () => {
  const [dados, setDados] = useState(null);
  const [dadosArm, setDadosArm] = useState(null);

  useEffect(() => {
    setDadosArm(dadosSimulados);
  }, []);

  useEffect(() => {
    // Using the proxy path instead of direct URL
    fetch("/api/termometria/101/-1")
      .then((resp) => resp.json())
      .then((data) => setDados(data))
      .catch((err) => {
        console.error("Error fetching data:", err);
        // Fallback to simulated data if fetch fails
        setDados(dadosSimulados);
      });
  }, []);

  if (!dados) return <div>Carregando...</div>;

  return (
    <div>
      {/* <SiloSVG dados={dados} /> */}
      <ArmazemSVG dados={dadosArm}/>
    </div>
  );
};

export default App;