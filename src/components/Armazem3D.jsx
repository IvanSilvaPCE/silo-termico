import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Billboard,
  Instances,
  Instance,
} from "@react-three/drei";
import * as THREE from "three";

// Memoizar função de cor para evitar recriações
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

// Geometrias compartilhadas
const SHARED_GEOMETRIES = {
  cabo: new THREE.CylinderGeometry(0.025, 0.025, 1, 8),
  sensor: new THREE.BoxGeometry(0.25, 0.12, 0.12),
  antena: new THREE.CylinderGeometry(0.01, 0.01, 0.08, 6),
  peso: new THREE.CylinderGeometry(0.06, 0.04, 0.15, 8),
  placa: new THREE.PlaneGeometry(0.8, 0.3),
};

// Materiais compartilhados
const SHARED_MATERIALS = {
  cabo: new THREE.MeshStandardMaterial({ color: "#1a1a1a", metalness: 0.8, roughness: 0.2 }),
  antena: new THREE.MeshStandardMaterial({ color: "#666666" }),
  peso: new THREE.MeshStandardMaterial({ color: "#555555", metalness: 0.8, roughness: 0.2 }),
  placa: new THREE.MeshStandardMaterial({ color: "#3A78FD", metalness: 0.2, roughness: 0.8 }),
};

const Pendulo3D = React.memo(({
  position,
  numero,
  sensores,
  arcoNumero,
  alturaArmazem,
  celulaNumero,
}) => {
  const grupoRef = useRef();

  const sensoresProcessados = useMemo(() => {
    return Object.entries(sensores).map(([sensorKey, valores]) => {
      const s = parseInt(sensorKey);
      const [temp, , , falha, nivel] = valores;
      return {
        key: s,
        temp,
        falha,
        nivel,
        cor: nivel ? corFaixaExata(temp) : "#cccccc"
      };
    });
  }, [sensores]);

  const espacamentoSensores = useMemo(() => 
    (alturaArmazem * 0.7) / (sensoresProcessados.length + 1)
  , [alturaArmazem, sensoresProcessados.length]);

  return (
    <group ref={grupoRef} position={position}>
      {/* Cabo principal */}
      <mesh position={[0, alturaArmazem / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, alturaArmazem * 0.9, 8]} />
        <primitive object={SHARED_MATERIALS.cabo} />
      </mesh>

      {/* Nome do pêndulo */}
      <Billboard position={[0, -0.8, 0]}>
        <mesh>
          <primitive object={SHARED_GEOMETRIES.placa} />
          <primitive object={SHARED_MATERIALS.placa} />
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

      {/* Sensores com instancing para melhor performance */}
      {sensoresProcessados.map((sensor, index) => {
        const yPos = alturaArmazem * 0.8 - sensor.key * espacamentoSensores;

        return (
          <group key={sensor.key} position={[0, yPos, 0]}>
            <mesh>
              <primitive object={SHARED_GEOMETRIES.sensor} />
              <meshStandardMaterial
                color={sensor.cor}
                emissive={sensor.falha ? "#ff0000" : sensor.cor}
                emissiveIntensity={sensor.falha ? 0.5 : 0.2}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>
            <mesh position={[0, 0.08, 0]}>
              <primitive object={SHARED_GEOMETRIES.antena} />
              <primitive object={SHARED_MATERIALS.antena} />
            </mesh>
          </group>
        );
      })}

      {/* Peso */}
      <mesh position={[0, 0.2, 0]}>
        <primitive object={SHARED_GEOMETRIES.peso} />
        <primitive object={SHARED_MATERIALS.peso} />
      </mesh>
    </group>
  );
});

const Motor3D = React.memo(({ position, id, status }) => {
  const grupoRef = useRef();
  const heliceRef = useRef();

  const cores = useMemo(() => ({
    0: "#c5c5c5",
    1: "#ffeb3b",
    3: "#31dd0f",
    4: "#ff0000",
  }), []);

  useFrame((state, delta) => {
    if (heliceRef.current && status === 3) {
      heliceRef.current.rotation.y += delta * 12;
    }
  });

  return (
    <group ref={grupoRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.15, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.25, 12]} />
        <meshStandardMaterial
          color={cores[status] || cores[0]}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      <group ref={heliceRef} position={[0, 0.3, 0]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.06, 0.04, 6]} />
          <meshStandardMaterial color="#2c2c2c" metalness={0.9} roughness={0.1} />
        </mesh>

        <Instances>
          <boxGeometry args={[0.25, 0.025, 0.06]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.6} roughness={0.3} />
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
    </group>
  );
});

const ArmazemStructure3D = React.memo(({
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

  const vigasInstances = useMemo(() => {
    return Array.from({ length: numeroArcos + 1 }, (_, i) => ({
      position: [-larguraArmazem / 2 + i * larguraArco, alturaArmazem / 2, 0],
      isSelected: i === arcoSelecionado,
    }));
  }, [numeroArcos, larguraArmazem, larguraArco, alturaArmazem, arcoSelecionado]);

  return (
    <group>
      {/* Base do armazém */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[larguraArmazem + 1, 0.6, profundidadeArmazem + 1]} />
        <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Paredes - usando instancing */}
      <Instances>
        <boxGeometry args={[0.3, alturaArmazem, profundidadeArmazem]} />
        <meshStandardMaterial color="#E0E0E0" transparent opacity={0.8} />
        <Instance position={[-larguraArmazem / 2 - 0.15, alturaArmazem / 2, 0]} />
        <Instance position={[larguraArmazem / 2 + 0.15, alturaArmazem / 2, 0]} />
      </Instances>

      <Instances>
        <boxGeometry args={[larguraArmazem, alturaArmazem, 0.3]} />
        <meshStandardMaterial color="#E0E0E0" transparent opacity={0.7} />
        <Instance position={[0, alturaArmazem / 2, -profundidadeArmazem / 2 - 0.15]} />
        <Instance position={[0, alturaArmazem / 2, profundidadeArmazem / 2 + 0.15]} />
      </Instances>

      {/* Telhado */}
      <group position={[0, alturaArmazem, 0]}>
        <Instances>
          <boxGeometry args={[larguraArmazem + 0.5, 0.15, profundidadeArmazem / 2 + 0.3]} />
          <meshStandardMaterial color="#666666" metalness={0.4} roughness={0.6} />
          <Instance 
            position={[0, alturaTelhado / 2, -profundidadeArmazem / 4]} 
            rotation={[-Math.PI / 6, 0, 0]} 
          />
          <Instance 
            position={[0, alturaTelhado / 2, profundidadeArmazem / 4]} 
            rotation={[Math.PI / 6, 0, 0]} 
          />
        </Instances>

        <mesh position={[0, alturaTelhado + 0.08, 0]}>
          <boxGeometry args={[larguraArmazem + 0.7, 0.25, 0.3]} />
          <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Vigas com instancing otimizado */}
      <Instances>
        <boxGeometry args={[0.15, alturaArmazem + 0.3, 0.15]} />
        <meshStandardMaterial color="#999999" metalness={0.6} roughness={0.4} />
        {vigasInstances.map((viga, index) => (
          <Instance
            key={index}
            position={viga.position}
            color={viga.isSelected ? "#FF6B35" : "#999999"}
          />
        ))}
      </Instances>

      {/* Highlights condicionais */}
      {tipoSelecao === "arco" && arcoSelecionado && arcoSelecionado <= numeroArcos && (
        <mesh
          position={[
            -larguraArmazem / 2 + (arcoSelecionado - 1) * larguraArco + larguraArco / 2,
            alturaArmazem / 2,
            0,
          ]}
        >
          <boxGeometry args={[larguraArco - 0.1, alturaArmazem + 0.5, profundidadeArmazem + 0.5]} />
          <meshStandardMaterial color="#FF6B35" transparent opacity={0.12} />
        </mesh>
      )}

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
          <meshStandardMaterial color="#35FF6B" transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  );
});

// Memoizar dados do armazém
const gerarDadosArmazem = () => {
  const dados = { leitura: {} };
  for (let pendulo = 1; pendulo <= 57; pendulo++) {
    dados.leitura[pendulo.toString()] = {};
    const numSensores = 6 + Math.floor(Math.random() * 5);
    for (let sensor = 1; sensor <= numSensores; sensor++) {
      const temp = 15 + Math.random() * 20;
      dados.leitura[pendulo.toString()][sensor.toString()] = [
        temp, false, "OK", false, true,
      ];
    }
  }
  return dados;
};

const ArmazemCompleto3D = React.memo(({
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

  const { penduloPositions, motoresPositions } = useMemo(() => {
    const positions = [];
    const larguraArmazem = numeroArcos * larguraArco;

    // Posições dos pêndulos
    for (let arco = 1; arco <= numeroArcos; arco++) {
      const xArco = -larguraArmazem / 2 + (arco - 1) * larguraArco + larguraArco / 2;
      let celulaDoArco;
      if (arco <= 6) celulaDoArco = 1;
      else if (arco <= 13) celulaDoArco = 2;
      else celulaDoArco = 3;

      for (let p = 0; p < pendulosPorArco; p++) {
        const numeroPendulo = (arco - 1) * pendulosPorArco + p + 1;
        const zLocal = -profundidadeArmazem / 3 + (p * profundidadeArmazem / 3);
        positions.push({
          position: [xArco, 0, zLocal],
          numero: numeroPendulo,
          arco: arco,
          celula: celulaDoArco,
        });
      }
    }

    // Posições dos motores
    const motoresConfig = [
      { arco: 2, pos: "superior" }, { arco: 5, pos: "superior" }, { arco: 8, pos: "superior" },
      { arco: 11, pos: "superior" }, { arco: 14, pos: "superior" }, { arco: 17, pos: "superior" },
      { arco: 3, pos: "inferior" }, { arco: 6, pos: "inferior" }, { arco: 9, pos: "inferior" },
      { arco: 12, pos: "inferior" }, { arco: 15, pos: "inferior" }, { arco: 18, pos: "inferior" },
    ];

    const motores = motoresConfig.map((config, index) => {
      const xMotor = -larguraArmazem / 2 + (config.arco - 1) * larguraArco + larguraArco / 2;
      const zMotor = config.pos === "superior" ? profundidadeArmazem / 2 + 1.2 : -profundidadeArmazem / 2 - 1.2;
      return {
        position: [xMotor, 0.2, zMotor],
        id: index + 1,
        status: Math.random() > 0.7 ? 3 : Math.random() > 0.3 ? 0 : 4,
      };
    });

    return { penduloPositions: positions, motoresPositions: motores };
  }, [numeroArcos, larguraArco, profundidadeArmazem]);

  return (
    <group>
      <ArmazemStructure3D
        numeroArcos={numeroArcos}
        arcoSelecionado={arcoSelecionado}
        celulaSelecionada={celulaSelecionada}
        tipoSelecao={tipoSelecao}
        alturaArmazem={alturaArmazem}
      />

      {penduloPositions.map((penduloInfo) => (
        <Pendulo3D
          key={penduloInfo.numero}
          position={penduloInfo.position}
          numero={penduloInfo.numero}
          sensores={dados.leitura[penduloInfo.numero.toString()] || {}}
          arcoNumero={penduloInfo.arco}
          alturaArmazem={alturaArmazem}
          celulaNumero={penduloInfo.celula}
        />
      ))}

      {motoresPositions.map((motorInfo, index) => (
        <Motor3D
          key={index}
          position={motorInfo.position}
          id={motorInfo.id}
          status={motorInfo.status}
        />
      ))}
    </group>
  );
});

const Armazem3D = () => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [arcoSelecionado, setArcoSelecionado] = useState(1);
  const [celulaSelecionada, setCelulaSelecionada] = useState(1);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [tipoSelecao, setTipoSelecao] = useState("arco");
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  const alturaArmazem = 8;
  const numeroArcos = 19;
  const numCelulas = 3;
  const larguraTotal = numeroArcos * 3.5;
  const canvasRef = useRef();

  const handleInteraction = useCallback(() => {
    setLastInteractionTime(Date.now());
  }, []);

  const handleAutoRotateChange = useCallback((e) => {
    setAutoRotate(e.target.checked);
  }, []);

  const handleTipoSelecaoChange = useCallback((e) => {
    setTipoSelecao(e.target.value);
  }, []);

  const handleArcoChange = useCallback((e) => {
    setArcoSelecionado(parseInt(e.target.value));
  }, []);

  const handleCelulaChange = useCallback((e) => {
    setCelulaSelecionada(parseInt(e.target.value));
  }, []);

  useEffect(() => {
    const inicializarDados = () => {
      setCarregando(true);
      const dadosGerados = gerarDadosArmazem();
      setDados(dadosGerados);
      setCarregando(false);
    };
    inicializarDados();
  }, []);

  if (carregando || !dados) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "18px" }}>
        Carregando Armazém 3D...
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh" }} onMouseMove={handleInteraction}>
      <div style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: 1000, background: "rgba(255,255,255,0.9)", padding: "10px", borderRadius: "5px" }}>
        <label style={{ marginRight: "20px" }}>
          <input type="checkbox" checked={autoRotate} onChange={handleAutoRotateChange} />
          Rotação Automática
        </label>

        <label style={{ marginRight: "20px" }}>
          Tipo de Seleção:
          <select value={tipoSelecao} onChange={handleTipoSelecaoChange} style={{ marginLeft: "5px" }}>
            <option value="arco">Arco</option>
            <option value="celula">Célula</option>
          </select>
        </label>

        {tipoSelecao === "arco" && (
          <label>
            Arco:
            <select value={arcoSelecionado} onChange={handleArcoChange} style={{ marginLeft: "5px" }}>
              {Array.from({ length: numeroArcos }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </label>
        )}

        {tipoSelecao === "celula" && (
          <label>
            Célula:
            <select value={celulaSelecionada} onChange={handleCelulaChange} style={{ marginLeft: "5px" }}>
              {Array.from({ length: numCelulas }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div style={{ position: "absolute", bottom: "10px", right: "10px", zIndex: 1000, background: "rgba(255,255,255,0.9)", padding: "10px", borderRadius: "5px", fontSize: "14px" }}>
        <div>19 Arcos | 3 Células | 57 Pêndulos</div>
        <div>• Célula 1: Arcos 1-6 (18 pêndulos)</div>
        <div>• Célula 2: Arcos 7-13 (21 pêndulos)</div>
        <div>• Célula 3: Arcos 14-19 (18 pêndulos)</div>
        {tipoSelecao === "arco" && (
          <div style={{ color: "#FF6B35" }}>
            <strong>Arco {arcoSelecionado}</strong>
          </div>
        )}
        {tipoSelecao === "celula" && (
          <div style={{ color: "#35FF6B" }}>
            <strong>Célula {celulaSelecionada}</strong>
          </div>
        )}
      </div>

      <Canvas
        camera={{ position: [larguraTotal * 0.8, alturaArmazem * 1.2, larguraTotal * 0.3], fov: 55 }}
        style={{ height: "100%", background: "linear-gradient(to bottom, #87CEEB, #E0F6FF)" }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[larguraTotal, alturaArmazem * 2.5, larguraTotal * 0.4]} intensity={1.2} castShadow />
        <directionalLight position={[-larguraTotal * 0.4, alturaArmazem * 1.8, -larguraTotal * 0.2]} intensity={0.7} color="#fff8dc" />

        <ArmazemCompleto3D
          dados={dados}
          arcoSelecionado={tipoSelecao === "arco" ? arcoSelecionado : null}
          celulaSelecionada={tipoSelecao === "celula" ? celulaSelecionada : null}
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
      </Canvas>
    </div>
  );
};

export default Armazem3D;