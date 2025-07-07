import React, { useState, useEffect } from "react";
import TopoArmazem from "./TopoArmazem";
import Armazem3D from "./Armazem3D";
import ArcoLateral from "./ArcoLateral";
import ModeladorSVG from "./ModeladorSVG";

const Armazem = () => {
  const [visualizacaoAtual, setVisualizacaoAtual] = useState("topo");
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [arcoSelecionado, setArcoSelecionado] = useState(1);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        // Carregar dados do arquivo JSON principal
        const response = await fetch("/attached_assets/modeloRotaArmazemPortal_1751897945212.json");
        const dadosCarregados = await response.json();
        setDados(dadosCarregados);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Fallback para dados locais se necessário
        try {
          const responseFallback = await fetch("/src/data/dadosArmazemTopo.json");
          const dadosFallback = await responseFallback.json();
          setDados(dadosFallback);
        } catch (fallbackError) {
          console.error("Erro ao carregar dados de fallback:", fallbackError);
        }
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  return (
    <div className="container-fluid">
      <h1>Visualização do Armazém</h1>
      <div>
        <button
          className={`btn ${
            visualizacaoAtual === "topo" ? "btn-primary" : "btn-outline-primary"
          } me-2`}
          onClick={() => setVisualizacaoAtual("topo")}
        >
          Topo
        </button>
        <button
          className={`btn ${
            visualizacaoAtual === "3d" ? "btn-primary" : "btn-outline-primary"
          } me-2`}
          onClick={() => setVisualizacaoAtual("3d")}
        >
          3D
        </button>
                    <button
                      className={`btn ${
                        visualizacaoAtual === "arco" ? "btn-primary" : "btn-outline-primary"
                      } me-2`}
                      onClick={() => setVisualizacaoAtual("arco")}
                    >
                      Arco Lateral
                    </button>
        <button
          className={`btn ${
            visualizacaoAtual === "modelador" ? "btn-primary" : "btn-outline-primary"
          } me-2`}
          onClick={() => setVisualizacaoAtual("modelador")}
        >
          Modelador SVG
        </button>
      </div>

      {carregando ? (
        <p>Carregando dados...</p>
      ) : (
        <div>
          {visualizacaoAtual === "topo" && <TopoArmazem dados={dados} />}
          {visualizacaoAtual === "3d" && <Armazem3D />}

                  {visualizacaoAtual === "arco" && (
                    <div>
                      <div className="mb-3 d-flex align-items-center">
                        <label className="form-label me-2 mb-0">Selecionar Arco:</label>
                        <select
                          className="form-select"
                          style={{ width: 'auto' }}
                          value={arcoSelecionado}
                          onChange={(e) => setArcoSelecionado(parseInt(e.target.value))}
                        >
                          {dados && dados.arcos && Object.keys(dados.arcos).map(arcoNum => (
                            <option key={arcoNum} value={arcoNum}>
                              Arco {arcoNum}
                            </option>
                          ))}
                        </select>
                      </div>
                      <ArcoLateral numeroArco={arcoSelecionado} dados={dados} />
                    </div>
                  )}
          {visualizacaoAtual === "modelador" && <ModeladorSVG />}
        </div>
      )}
    </div>
  );
};

export default Armazem;