
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Billboard,
  Instances,
  Instance,
} from "@react-three/drei";
import * as THREE from "three";

const Pendulo3D = ({
  position,
  numero,
  sensores,
  arcoNumero,
  alturaArmazem,
  celulaNumero,
}) => {
  const grupoRef = useRef();

  // Função para determinar cor baseada na temperatura
  const corFaixaExata = (t) => {
    if (t === -1000) return "#ff0000";
    if (t < 12) return "#0384fc";
    else if (t < 15) return "#03e8fc";
    else if (t < 17) return "#03fcbe";
    else if (t < 21) return "#07fc03";
    else if (t < 25) return "#c3ff00";
    else if (t < 27) return "#fcf803";
    else if (t < 30) return "#ffb300";
    else if (t < 35) return "#ff2200";
    else if (t < 50) return "#ff0090";
    else return "#f700ff";
  };

  const espacamentoSensores =
    (alturaArmazem * 0.7) / (Object.keys(sensores).length + 1);

  return (
    <group ref={grupoRef} position={position}>
      {/* Cabo principal - do teto até próximo ao chão */}
      <mesh position={[0, alturaArmazem / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, alturaArmazem * 0.9, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Nome do pêndulo na base, fora do armazém */}
      <Billboard position={[0, -0.8, 0]}>
        <mesh>
          <planeGeometry args={[0.8, 0.3]} />
          <meshStandardMaterial
            color="#3A78FD"
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          P{numero}
        </Text>
      </Billboard>

      {/* Sensores ao longo do cabo com geometria individual para melhor visualização */}
      {Object.entries(sensores).map(([sensorKey, valores], index) => {
        const s = parseInt(sensorKey);
        const [temp, ponto_quente, , falha, nivel] = valores;
        const yPos = alturaArmazem * 0.8 - s * espacamentoSensores;
        const cor = nivel ? corFaixaExata(temp) : "#cccccc";

        return (
          <group key={s} position={[0, yPos, 0]}>
            {/* Corpo do sensor */}
            <mesh>
              <boxGeometry args={[0.25, 0.12, 0.12]} />
              <meshStandardMaterial
                color={cor}
                emissive={falha ? "#ff0000" : ponto_quente ? "#ffaa00" : cor}
                emissiveIntensity={falha ? 0.5 : ponto_quente ? 0.3 : 0.2}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>

            {/* Antena do sensor */}
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.08, 8]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          </group>
        );
      })}

      {/* Peso na extremidade */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.15, 12]} />
        <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

const Motor3D = ({ position, id, status }) => {
  const grupoRef = useRef();
  const heliceRef = useRef();

  const cores = {
    0: "#c5c5c5", // desligado
    1: "#ffeb3b", // startando
    3: "#31dd0f", // ligado
    4: "#ff0000", // erro
  };

  useFrame((state, delta) => {
    if (heliceRef.current && status === 3) {
      heliceRef.current.rotation.y += delta * 12;
    }
  });

  return (
    <group ref={grupoRef} position={position}>
      {/* Base do motor */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.15, 24]} />
        <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Corpo do motor principal */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.25, 16]} />
        <meshStandardMaterial
          color={cores[status] || cores[0]}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Hélices simplificadas */}
      <group ref={heliceRef} position={[0, 0.3, 0]}>
        {/* Hub central */}
        <mesh>
          <cylinderGeometry args={[0.08, 0.06, 0.04, 8]} />
          <meshStandardMaterial
            color="#2c2c2c"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Pás da hélice com instancing */}
        <Instances>
          <boxGeometry args={[0.25, 0.025, 0.06]} />
          <meshStandardMaterial
            color="#f0f0f0"
            metalness={0.6}
            roughness={0.3}
          />
          {[0, 120, 240].map((angle, index) => (
            <Instance
              key={index}
              position={[
                Math.cos((angle * Math.PI) / 180) * 0.15,
                0,
                Math.sin((angle * Math.PI) / 180) * 0.15,
              ]}
              rotation={[0, (angle * Math.PI) / 180, Math.PI / 8]}
            />
          ))}
        </Instances>
      </group>

      {/* Placa de identificação */}
      <Billboard position={[0, 0.05, 0.3]}>
        <mesh>
          <planeGeometry args={[0.25, 0.08]} />
          <meshStandardMaterial color="#2E86AB" />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.035}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          AE-{id}
        </Text>
      </Billboard>

      {/* LED indicador de status */}
      <mesh position={[0, 0.25, 0.25]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial
          color={cores[status] || cores[0]}
          emissive={status === 3 ? cores[status] : "#000000"}
          emissiveIntensity={status === 3 ? 0.8 : 0}
        />
      </mesh>
    </group>
  );
};

const ArmazemStructure3D = ({
  numeroArcos,
  arcoSelecionado,
  celulaSelecionada,
  tipoSelecao,
  alturaArmazem,
}) => {
  const larguraArco = 3.5;
  const larguraArmazem = numeroArcos * larguraArco;
  const profundidadeArmazem = 6;
  const alturaTelhado = alturaArmazem * 0.35;

  return (
    <group>
      {/* Base/Piso do armazém */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry
          args={[larguraArmazem + 1, 0.6, profundidadeArmazem + 1]}
        />
        <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Estrutura principal do armazém */}
      <group>
        {/* Paredes laterais */}
        <mesh
          position={[-larguraArmazem / 2 - 0.15, alturaArmazem / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.3, alturaArmazem, profundidadeArmazem]} />
          <meshStandardMaterial
            color="#E0E0E0"
            transparent
            opacity={0.8}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        <mesh
          position={[larguraArmazem / 2 + 0.15, alturaArmazem / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.3, alturaArmazem, profundidadeArmazem]} />
          <meshStandardMaterial
            color="#E0E0E0"
            transparent
            opacity={0.8}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Paredes das extremidades */}
        <mesh
          position={[0, alturaArmazem / 2, -profundidadeArmazem / 2 - 0.15]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[larguraArmazem, alturaArmazem, 0.3]} />
          <meshStandardMaterial
            color="#E0E0E0"
            transparent
            opacity={0.7}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        <mesh
          position={[0, alturaArmazem / 2, profundidadeArmazem / 2 + 0.15]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[larguraArmazem, alturaArmazem, 0.3]} />
          <meshStandardMaterial
            color="#E0E0E0"
            transparent
            opacity={0.7}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Telhado duas águas */}
        <group position={[0, alturaArmazem, 0]}>
          <mesh
            position={[0, alturaTelhado / 2, -profundidadeArmazem / 4]}
            rotation={[-Math.PI / 6, 0, 0]}
            castShadow
          >
            <boxGeometry
              args={[larguraArmazem + 0.5, 0.15, profundidadeArmazem / 2 + 0.3]}
            />
            <meshStandardMaterial
              color="#666666"
              metalness={0.4}
              roughness={0.6}
            />
          </mesh>

          <mesh
            position={[0, alturaTelhado / 2, profundidadeArmazem / 4]}
            rotation={[Math.PI / 6, 0, 0]}
            castShadow
          >
            <boxGeometry
              args={[larguraArmazem + 0.5, 0.15, profundidadeArmazem / 2 + 0.3]}
            />
            <meshStandardMaterial
              color="#666666"
              metalness={0.4}
              roughness={0.6}
            />
          </mesh>

          {/* Cumeeira central */}
          <mesh position={[0, alturaTelhado + 0.08, 0]} castShadow>
            <boxGeometry args={[larguraArmazem + 0.7, 0.25, 0.3]} />
            <meshStandardMaterial
              color="#444444"
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        </group>

        {/* Vigas verticais */}
        <Instances>
          <boxGeometry args={[0.15, alturaArmazem + 0.3, 0.15]} />
          <meshStandardMaterial
            color="#999999"
            metalness={0.6}
            roughness={0.4}
          />
          {Array.from({ length: numeroArcos + 1 }, (_, i) => {
            const x = -larguraArmazem / 2 + i * larguraArco;
            const isSelected = i === arcoSelecionado;

            return (
              <Instance
                key={i}
                position={[x, alturaArmazem / 2, 0]}
                color={isSelected ? "#FF6B35" : "#999999"}
              />
            );
          })}
        </Instances>

        {/* Labels para arcos selecionados */}
        {arcoSelecionado && (
          <Billboard
            position={[
              -larguraArmazem / 2 +
                (arcoSelecionado - 1) * larguraArco +
                larguraArco / 2,
              alturaArmazem + alturaTelhado + 0.8,
              0,
            ]}
          >
            <Text
              fontSize={0.3}
              color="#FF6B35"
              anchorX="center"
              anchorY="middle"
            >
              {arcoSelecionado}
            </Text>
          </Billboard>
        )}
      </group>

      {/* Highlight do arco selecionado */}
      {tipoSelecao === "arco" &&
        arcoSelecionado &&
        arcoSelecionado <= numeroArcos && (
          <mesh
            position={[
              -larguraArmazem / 2 +
                (arcoSelecionado - 1) * larguraArco +
                larguraArco / 2,
              alturaArmazem / 2,
              0,
            ]}
          >
            <boxGeometry
              args={[
                larguraArco - 0.1,
                alturaArmazem + 0.5,
                profundidadeArmazem + 0.5,
              ]}
            />
            <meshStandardMaterial
              color="#FF6B35"
              transparent
              opacity={0.12}
              wireframe={false}
            />
          </mesh>
        )}

      {/* Highlight da célula selecionada */}
      {tipoSelecao === "celula" && celulaSelecionada && (
        <mesh
          position={[
            celulaSelecionada === 1
              ? -larguraArmazem / 2 + (larguraArco * 3)
              : celulaSelecionada === 2
                ? -larguraArco * 3.5
                : larguraArmazem / 2 - (larguraArco * 3),
            alturaArmazem / 2,
            0,
          ]}
        >
          <boxGeometry
            args={[
              celulaSelecionada === 1
                ? larguraArco * 6 + 0.5
                : celulaSelecionada === 2
                  ? larguraArco * 7 + 0.5
                  : larguraArco * 6 + 0.5,
              alturaArmazem + 0.5,
              profundidadeArmazem + 0.5,
            ]}
          />
          <meshStandardMaterial
            color="#35FF6B"
            transparent
            opacity={0.15}
            wireframe={false}
          />
        </mesh>
      )}
    </group>
  );
};

const ArmazemCompleto3D = ({
  dados,
  arcoSelecionado,
  celulaSelecionada,
  tipoSelecao,
  alturaArmazem,
}) => {
  const numeroArcos = 19;
  const pendulosPorArco = 3;
  const larguraArco = 3.5;
  const profundidadeArmazem = 6;

  // Mapear pêndulos por arco baseado na estrutura real dos dados
  const penduloPositions = useMemo(() => {
    const positions = [];
    const larguraArmazem = numeroArcos * larguraArco;

    // Usar a estrutura real dos dados: arcos -> pêndulos
    Object.entries(dados.arcos || {}).forEach(([arcoKey, arcoData]) => {
      const arcoNumero = parseInt(arcoKey);
      
      // Determinar célula baseado na sequencia_celulas
      let celulaDoArco = 1;
      const sequenciaCelulas = dados.configuracao?.sequencia_celulas || {};
      
      for (const [key, config] of Object.entries(sequenciaCelulas)) {
        if (config.sequencia_pendulos) {
          const pendulosNaCelula = config.sequencia_pendulos;
          const penduloDentroDaCelula = Object.keys(arcoData).some(pendulo => 
            pendulosNaCelula.includes(parseInt(pendulo))
          );
          if (penduloDentroDaCelula) {
            celulaDoArco = config.celula;
            break;
          }
        }
      }

      const xArco = -larguraArmazem / 2 + (arcoNumero - 1) * larguraArco + larguraArco / 2;

      // Processar cada pêndulo no arco
      Object.entries(arcoData).forEach(([penduloKey, sensores], index) => {
        const numeroPendulo = parseInt(penduloKey);
        const zLocal = -profundidadeArmazem / 3 + ((index % pendulosPorArco) * profundidadeArmazem / 3);

        positions.push({
          position: [xArco, 0, zLocal],
          numero: numeroPendulo,
          arco: arcoNumero,
          celula: celulaDoArco,
          sensores: sensores,
        });
      });
    });

    return positions;
  }, [dados]);

  // Posições dos motores baseado na configuração
  const motoresPositions = useMemo(() => {
    const positions = [];
    const larguraArmazem = numeroArcos * larguraArco;

    const motoresConfig = [
      { arco: 2, pos: "superior" },
      { arco: 5, pos: "superior" },
      { arco: 8, pos: "superior" },
      { arco: 11, pos: "superior" },
      { arco: 14, pos: "superior" },
      { arco: 17, pos: "superior" },
      { arco: 3, pos: "inferior" },
      { arco: 6, pos: "inferior" },
      { arco: 9, pos: "inferior" },
      { arco: 12, pos: "inferior" },
      { arco: 15, pos: "inferior" },
      { arco: 18, pos: "inferior" },
    ];

    motoresConfig.forEach((config, index) => {
      const xMotor = -larguraArmazem / 2 + (config.arco - 1) * larguraArco + larguraArco / 2;
      let zMotor, yMotor;

      if (config.pos === "superior") {
        zMotor = profundidadeArmazem / 2 + 1.2;
        yMotor = 0.2;
      } else if (config.pos === "inferior") {
        zMotor = -profundidadeArmazem / 2 - 1.2;
        yMotor = 0.2;
      }

      positions.push({
        position: [xMotor, yMotor, zMotor],
        id: index + 1,
        status: Math.random() > 0.7 ? 3 : Math.random() > 0.3 ? 0 : 4,
      });
    });

    return positions;
  }, []);

  return (
    <group>
      {/* Estrutura do armazém */}
      <ArmazemStructure3D
        numeroArcos={numeroArcos}
        arcoSelecionado={arcoSelecionado}
        celulaSelecionada={celulaSelecionada}
        tipoSelecao={tipoSelecao}
        alturaArmazem={alturaArmazem}
      />

      {/* Renderizar pêndulos */}
      {penduloPositions.map((penduloInfo) => (
        <Pendulo3D
          key={penduloInfo.numero}
          position={penduloInfo.position}
          numero={penduloInfo.numero}
          sensores={penduloInfo.sensores}
          arcoNumero={penduloInfo.arco}
          alturaArmazem={alturaArmazem}
          celulaNumero={penduloInfo.celula}
        />
      ))}

      {/* Temperaturas sempre visíveis */}
      <group renderOrder={1000}>
        {penduloPositions.map((penduloInfo) => {
          const sensoresData = penduloInfo.sensores || {};
          const espacamentoSensores = (alturaArmazem * 0.7) / (Object.keys(sensoresData).length + 1);

          return Object.entries(sensoresData).map(([sensorKey, valores], index) => {
            const s = parseInt(sensorKey);
            const [temp, ponto_quente, , falha] = valores;
            const yPos = alturaArmazem * 0.8 - s * espacamentoSensores;
            const position = [
              penduloInfo.position[0] + 0.4,
              yPos,
              penduloInfo.position[2],
            ];

            return (
              <Billboard
                key={`temp-${penduloInfo.numero}-${s}`}
                position={position}
              >
                <Text
                  fontSize={0.12}
                  color={falha ? "#ff0000" : ponto_quente ? "#ffaa00" : "#00ff00"}
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.04}
                  outlineColor="#000000"
                >
                  <meshBasicMaterial
                    attach="material"
                    transparent
                    depthTest={false}
                    depthWrite={false}
                  />
                  {falha ? "ERR" : ponto_quente ? "HOT" : `${temp.toFixed(1)}°C`}
                </Text>
              </Billboard>
            );
          });
        })}
      </group>

      {/* Motores */}
      {motoresPositions.map((motorInfo, index) => (
        <Motor3D
          key={index}
          position={motorInfo.position}
          id={motorInfo.id}
          status={motorInfo.status}
        />
      ))}

      {/* Sistema de iluminação interno */}
      {Array.from({ length: Math.ceil(numeroArcos / 3) }, (_, i) => (
        <pointLight
          key={i}
          position={[
            -numeroArcos * 1.5 + i * larguraArco * 3,
            alturaArmazem * 0.7,
            0,
          ]}
          intensity={0.5}
          distance={12}
          decay={2}
          color="#fff8dc"
        />
      ))}
    </group>
  );
};

const Armazem3D = () => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [arcoSelecionado, setArcoSelecionado] = useState(1);
  const [celulaSelecionada, setCelulaSelecionada] = useState(1);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [tipoSelecao, setTipoSelecao] = useState("arco");
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [zoomedIn, setZoomedIn] = useState(false);

  const alturaArmazem = 8;
  const numeroArcos = 19;
  const numCelulas = 3;
  const larguraTotal = numeroArcos * 3.5;
  const canvasRef = useRef();

  // Funções de zoom
  const zoomToCenter = () => {
    if (canvasRef.current) {
      const controls = canvasRef.current.controls;
      if (controls) {
        controls.target.set(0, alturaArmazem / 2, 0);
        controls.distance = larguraTotal * 0.3;
        setZoomedIn(true);
      }
    }
  };

  const resetZoom = () => {
    if (canvasRef.current) {
      const controls = canvasRef.current.controls;
      if (controls) {
        controls.target.set(0, alturaArmazem / 2, 0);
        controls.distance = larguraTotal * 0.8;
        setZoomedIn(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastInteractionTime >= 15000 && !zoomedIn) {
        zoomToCenter();
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [lastInteractionTime, zoomedIn, alturaArmazem, larguraTotal]);

  const handleInteraction = () => {
    setLastInteractionTime(Date.now());
    if (zoomedIn) {
      resetZoom();
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        // Carregar dados do arquivo JSON
        const response = await fetch('/attached_assets/modeloRotaArmazemPortal_1751897097173.json');
        const dadosCarregados = await response.json();
        setDados(dadosCarregados);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Fallback para dados básicos
        setDados({
          arcos: {},
          configuracao: {
            sequencia_celulas: {
              "131": { celula: 1, sequencia_pendulos: [] },
              "132": { celula: 2, sequencia_pendulos: [] },
              "133": { celula: 3, sequencia_pendulos: [] }
            }
          }
        });
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  if (carregando || !dados) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Carregando Armazém 3D...
      </div>
    );
  }

  return (
    <div
      style={{ width: "100%", height: "100vh" }}
      onMouseMove={handleInteraction}
      onMouseDown={handleInteraction}
      onWheel={handleInteraction}
    >
      {/* Controles */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          zIndex: 1000,
          background: "rgba(255,255,255,0.9)",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <label style={{ marginRight: "20px" }}>
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
          />
          Rotação Automática
        </label>

        <label style={{ marginRight: "20px" }}>
          Tipo de Seleção:
          <select
            value={tipoSelecao}
            onChange={(e) => setTipoSelecao(e.target.value)}
            style={{ marginLeft: "5px" }}
          >
            <option value="arco">Arco</option>
            <option value="celula">Célula</option>
          </select>
        </label>

        {tipoSelecao === "arco" && (
          <label>
            Arco:
            <select
              value={arcoSelecionado}
              onChange={(e) => setArcoSelecionado(parseInt(e.target.value))}
              style={{ marginLeft: "5px" }}
            >
              {Array.from({ length: numeroArcos }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
        )}

        {tipoSelecao === "celula" && (
          <label>
            Célula:
            <select
              value={celulaSelecionada}
              onChange={(e) => setCelulaSelecionada(parseInt(e.target.value))}
              style={{ marginLeft: "5px" }}
            >
              {Array.from({ length: numCelulas }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Informações */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          zIndex: 1000,
          background: "rgba(255,255,255,0.9)",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "14px",
        }}
      >
        <div>19 Arcos</div>
        <div>57 Pêndulos (3 por arco)</div>
        <div>3 Células conforme sequencia_celulas</div>
        <div>~12 Motores aeradores</div>
        {tipoSelecao === "arco" && (
          <div style={{ color: "#FF6B35" }}>
            <strong>Arco {arcoSelecionado} selecionado</strong>
          </div>
        )}
        {tipoSelecao === "celula" && (
          <div style={{ color: "#35FF6B" }}>
            <strong>Célula {celulaSelecionada} selecionada</strong>
          </div>
        )}
      </div>

      {/* Canvas 3D */}
      <Canvas
        camera={{
          position: [
            larguraTotal * 0.8,
            alturaArmazem * 1.2,
            larguraTotal * 0.3,
          ],
          fov: 55,
        }}
        style={{
          height: "100%",
          background: "linear-gradient(to bottom, #87CEEB, #E0F6FF)",
        }}
        shadows
      >
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[larguraTotal, alturaArmazem * 2.5, larguraTotal * 0.4]}
          intensity={1.2}
          castShadow
        />
        <directionalLight
          position={[
            -larguraTotal * 0.4,
            alturaArmazem * 1.8,
            -larguraTotal * 0.2,
          ]}
          intensity={0.7}
          color="#fff8dc"
        />

        <ArmazemCompleto3D
          dados={dados}
          arcoSelecionado={tipoSelecao === "arco" ? arcoSelecionado : null}
          celulaSelecionada={
            tipoSelecao === "celula" ? celulaSelecionada : null
          }
          tipoSelecao={tipoSelecao}
          alturaArmazem={alturaArmazem}
        />

        <OrbitControls
          ref={canvasRef}
          autoRotate={autoRotate}
          autoRotateSpeed={0.15}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={larguraTotal * 0.25}
          maxDistance={larguraTotal * 1.2}
          target={[0, alturaArmazem / 2, 0]}
        />

        {/* Grade do chão */}
        <group position={[0, -1, 0]}>
          <Instances>
            <boxGeometry args={[larguraTotal * 1.1, 0.015, 0.015]} />
            <meshStandardMaterial color="#666666" />
            {Array.from({ length: Math.ceil(larguraTotal / 8) + 1 }, (_, i) => (
              <Instance
                key={`h-${i}`}
                position={[0, 0, (i - Math.ceil(larguraTotal / 16)) * 8]}
              />
            ))}
          </Instances>
          <Instances>
            <boxGeometry args={[0.015, 0.015, larguraTotal * 0.8]} />
            <meshStandardMaterial color="#666666" />
            {Array.from({ length: Math.ceil(larguraTotal / 8) + 1 }, (_, i) => (
              <Instance
                key={`v-${i}`}
                position={[(i - Math.ceil(larguraTotal / 16)) * 8, 0, 0]}
              />
            ))}
          </Instances>
        </group>
      </Canvas>
    </div>
  );
};

export default Armazem3D;
