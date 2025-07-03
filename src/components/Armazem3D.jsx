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
          C{numero}
        </Text>
      </Billboard>

      {/* Sensores ao longo do cabo com geometria individual para melhor visualização */}
      {Object.entries(sensores).map(([sensorKey, valores], index) => {
        const s = parseInt(sensorKey);
        const [temp, , , falha, nivel] = valores;
        const yPos = alturaArmazem * 0.8 - s * espacamentoSensores;
        const cor = nivel ? corFaixaExata(temp) : "#cccccc";

        return (
          <group key={s} position={[0, yPos, 0]}>
            {/* Corpo do sensor */}
            <mesh>
              <boxGeometry args={[0.25, 0.12, 0.12]} />
              <meshStandardMaterial
                color={cor}
                emissive={falha ? "#ff0000" : cor}
                emissiveIntensity={falha ? 0.5 : 0.2}
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
  const larguraArco = 3.5; // Compactado de 6 para 3.5
  const larguraArmazem = numeroArcos * larguraArco;
  const profundidadeArmazem = 6; // Reduzido de 8 para 6
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
        {/* Paredes laterais - mais baixas e compactas */}
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

        {/* Telhado compacto duas águas */}
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

        {/* Vigas verticais com instancing */}
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

        {/* Labels apenas para arcos selecionados */}
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

        {/* Divisões das 3 células por arco */}
        {/* Removendo as divisórias */}
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
            // Posição X baseada na célula selecionada (divisão lateral)
            celulaSelecionada === 1
              ? -larguraArmazem / 2 + (larguraArco * 3) // Célula 1: arcos 1-6
              : celulaSelecionada === 2
                ? -larguraArco * 3.5 // Célula 2: arcos 7-13  
                : larguraArmazem / 2 - (larguraArco * 3), // Célula 3: arcos 14-19
            alturaArmazem / 2,
            0, // Centrado em Z
          ]}
        >
          <boxGeometry
            args={[
              // Largura baseada no número de arcos por célula
              celulaSelecionada === 1
                ? larguraArco * 6 + 0.5 // 6 arcos (1-6)
                : celulaSelecionada === 2
                  ? larguraArco * 7 + 0.5 // 7 arcos (7-13)
                  : larguraArco * 6 + 0.5, // 6 arcos (14-19)
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

// Função para gerar dados de exemplo com 19 arcos e 3 pêndulos por arco (57 pêndulos total, divididos em 3 células)
const gerarDadosArmazem = () => {
  const dados = { leitura: {} };

  // Gerar dados para 57 pêndulos (numeração de 1 a 57)
  for (let pendulo = 1; pendulo <= 57; pendulo++) {
    dados.leitura[pendulo.toString()] = {};

    // Cada pêndulo tem entre 6-10 sensores
    const numSensores = 6 + Math.floor(Math.random() * 5);

    for (let sensor = 1; sensor <= numSensores; sensor++) {
      const temp = 15 + Math.random() * 20; // Temperatura entre 15-35°C
      dados.leitura[pendulo.toString()][sensor.toString()] = [
        temp, // temperatura
        false, // alarme
        "OK", // qualidade
        false, // falha
        true, // ativo
      ];
    }
  }

  return dados;
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

  const penduloPositions = useMemo(() => {
    const positions = [];
    const larguraArmazem = numeroArcos * larguraArco;

    for (let arco = 1; arco <= numeroArcos; arco++) {
      const xArco =
        -larguraArmazem / 2 + (arco - 1) * larguraArco + larguraArco / 2;

      // Determinar célula baseado no arco (seguindo a lógica da visão topo)
      let celulaDoArco;
      if (arco <= 6) celulaDoArco = 1;        // Arcos 1-6: Célula 1
      else if (arco <= 13) celulaDoArco = 2;  // Arcos 7-13: Célula 2
      else celulaDoArco = 3;                  // Arcos 14-19: Célula 3

      // 3 pêndulos por arco, todos na mesma célula
      for (let p = 0; p < pendulosPorArco; p++) {
        const numeroPendulo = (arco - 1) * pendulosPorArco + p + 1;
        
        // Distribuir os 3 pêndulos em profundidade dentro da mesma célula
        const zLocal = -profundidadeArmazem / 3 + (p * profundidadeArmazem / 3);

        positions.push({
          position: [xArco, 0, zLocal],
          numero: numeroPendulo,
          arco: arco,
          celula: celulaDoArco, // Todos os pêndulos do arco pertencem à mesma célula
        });
      }
    }

    return positions;
  }, []);

  // Posições dos motores baseado na imagem do topo 2D - FORA do armazém
  const motoresPositions = useMemo(() => {
    const positions = [];
    const larguraArmazem = numeroArcos * larguraArco;

    // Baseado no layout do topo 2D: motores nas bordas superior e inferior
    const motoresConfig = [
      // Motores na borda superior (fora do armazém)
      { arco: 2, pos: "superior" },
      { arco: 5, pos: "superior" },
      { arco: 8, pos: "superior" },
      { arco: 11, pos: "superior" },
      { arco: 14, pos: "superior" },
      { arco: 17, pos: "superior" },

      // Motores na borda inferior (fora do armazém)
      { arco: 3, pos: "inferior" },
      { arco: 6, pos: "inferior" },
      { arco: 9, pos: "inferior" },
      { arco: 12, pos: "inferior" },
      { arco: 15, pos: "inferior" },
      { arco: 18, pos: "inferior" },
    ];

    motoresConfig.forEach((config, index) => {
      const xMotor =
        -larguraArmazem / 2 + (config.arco - 1) * larguraArco + larguraArco / 2;
      let zMotor, yMotor;

      if (config.pos === "superior") {
        zMotor = profundidadeArmazem / 2 + 1.2; // Bem fora do armazém
        yMotor = 0.2;
      } else if (config.pos === "inferior") {
        zMotor = -profundidadeArmazem / 2 - 1.2; // Bem fora do armazém
        yMotor = 0.2;
      }

      positions.push({
        position: [xMotor, yMotor, zMotor],
        id: index + 1,
        status: Math.random() > 0.7 ? 3 : Math.random() > 0.3 ? 0 : 4, // Maioria ligados
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
      {penduloPositions.map((penduloInfo) => {
        const sensoresData = dados.leitura[penduloInfo.numero.toString()] || {};

        return (
          <Pendulo3D
            key={penduloInfo.numero}
            position={penduloInfo.position}
            numero={penduloInfo.numero}
            sensores={sensoresData}
            arcoNumero={penduloInfo.arco}
            alturaArmazem={alturaArmazem}
            celulaNumero={penduloInfo.celula}
          />
        );
      })}

      {/* Grupo especial para temperaturas sempre visíveis */}
      <group renderOrder={1000}>
        {penduloPositions.map((penduloInfo) => {
          const sensoresData =
            dados.leitura[penduloInfo.numero.toString()] || {};
          const espacamentoSensores =
            (alturaArmazem * 0.7) / (Object.keys(sensoresData).length + 1);

          return Object.entries(sensoresData).map(
            ([sensorKey, valores], index) => {
              const s = parseInt(sensorKey);
              const [temp, , , falha] = valores;
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
                    color={falha ? "#ff0000" : "#00ff00"}
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
                    {falha ? "ERR" : `${temp.toFixed(1)}°C`}
                  </Text>
                </Billboard>
              );
            },
          );
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
  const [tipoSelecao, setTipoSelecao] = useState("arco"); // 'arco' ou 'celula'
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [zoomedIn, setZoomedIn] = useState(false);

  const alturaArmazem = 8; // Reduzido de 10 para 8
  const numeroArcos = 19;
  const numCelulas = 3; // 3 células por arco
  const larguraTotal = numeroArcos * 3.5;
  const canvasRef = useRef();

  // Function to handle zoom in
  const zoomToCenter = () => {
    if (canvasRef.current) {
      const controls = canvasRef.current.controls;
      if (controls) {
        controls.target.set(0, alturaArmazem / 2, 0); // Zoom to the center of the warehouse
        controls.distance = larguraTotal * 0.3; // Adjust the zoom distance as needed
        setZoomedIn(true);
      }
    }
  };

  // Function to handle zoom out
  const resetZoom = () => {
    if (canvasRef.current) {
      const controls = canvasRef.current.controls;
      if (controls) {
        controls.target.set(0, alturaArmazem / 2, 0); // Reset zoom target
        controls.distance = larguraTotal * 0.8; // Reset to default distance
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

  // Reset timer on user interaction
  const handleInteraction = () => {
    setLastInteractionTime(Date.now());
    if (zoomedIn) {
      resetZoom();
    }
  };

  useEffect(() => {
    const inicializarDados = async () => {
      try {
        setCarregando(true);
        const dadosGerados = gerarDadosArmazem();
        setDados(dadosGerados);
      } catch (error) {
        console.error("Erro ao inicializar dados 3D:", error);
      } finally {
        setCarregando(false);
      }
    };

    inicializarDados();
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
      {/* Controles simples */}
      <div
        style={{
          position: "absolute",
          top: "10px",
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

        {/* Seletor de tipo de seleção */}
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

      {/* Informações dos dados */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          background: "rgba(255,255,255,0.9)",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "14px",
        }}
      >
        <div>19 Arcos</div>
        <div>3 Células (divisão lateral)</div>
        <div>• Célula 1: Arcos 1-6 (18 pêndulos)</div>
        <div>• Célula 2: Arcos 7-13 (21 pêndulos)</div>
        <div>• Célula 3: Arcos 14-19 (18 pêndulos)</div>
        <div>~12 Motores aeradores (fora do armazém)</div>
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
        {/* Iluminação */}
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

        {/* Estrutura completa do armazém */}
        <ArmazemCompleto3D
          dados={dados}
          arcoSelecionado={tipoSelecao === "arco" ? arcoSelecionado : null}
          celulaSelecionada={
            tipoSelecao === "celula" ? celulaSelecionada : null
          }
          tipoSelecao={tipoSelecao}
          alturaArmazem={alturaArmazem}
        />

        {/* Controles de câmera */}
        <OrbitControls
          ref={canvasRef}
          autoRotate={autoRotate}
          autoRotateSpeed={0.15}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={larguraTotal * 0.25}
          maxDistance={larguraTotal * 1.2}
          target={[0, alturaArmazem / 2, 0]} // set initial target
        />

        {/* Grade simplificada do chão */}
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
