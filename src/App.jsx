import React, { useState, useEffect } from "react";
import SiloSVG from "./components/Silo";
import ArmazemSVG from './components/Armazem';
import dadosSimulados from "./dados";
import dadosSimuladosSilo from "./dadosSilo";

const App = () => {
  const [dados, setDados] = useState(null);
  const [dadosArm, setDadosArm] = useState(null);
  const [dadosSilo, setDadosSilo] = useState(null);

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

  return (
    <div>
      {/* <SiloSVG dados={dadosSilo} /> */}
      {/* <SiloSVG dados={dados} /> */}
      <ArmazemSVG dados={dadosArm}/>
    </div>

  );
};

export default App;
