import React, { useState, useEffect } from "react";
import SiloSVG from "./components/Silo";

const App = () => {
  const [leituras, setLeituras] = useState({});

  // useEffect(() => {
  //   fetch("http://172.16.1.85:3333/termometria/101/-1") // Silo 3
  //   // fetch("http://172.16.1.85:3333/termometria/142/-1") // Silo 5
  //     .then((response) => response.json())
  //     .then((data) => setLeituras(data.leitura))
  //     .catch((error) => console.error("Erro ao buscar dados:", error));
  // }, []);

  return (
    <div>
      <SiloSVG leituras={leituras} />
    </div>
  );
};

export default App;