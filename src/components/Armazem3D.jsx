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

const Pendulo3D = ({ position, numero, dados, arcoNumero }) => {
  const grupoRef = useRef();

  // Função para determinar cor baseada na temperatura
  const corFaixaExata = (t) => {
    if (t === -1000 || t === 0) return "#666666";
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

  // Buscar dados do pêndulo nos arcos detalhados
  const sensoresArco = useMemo(() => {
    if (!dados.arcos || !dados.arcos[arcoNumero] || !dados.arcos[arcoNumero][numero]) {
      return [];
    }

    const sensoresPendulo = dados.arcos[arcoNumero][numero];
    return Object.entries(sensoresPendulo).map(([sensorId, sensorData]) => ({
      id: sensorId,
      temperatura: sensorData[0],
      ponto_quente: sensorData[1],
      pre_alarme: sensorData[2],
      falha: sensorData[3],
      ativo: sensorData[4]
    }));
  }, [dados, arcoNumero, numero]);

  // Buscar dados básicos do pêndulo
  const dadosBasicos = useMemo(() => {
    if (!dados.pendulos || !dados.pendulos[numero]) {
      return { alarme: false, pre_alarme: false, ativo: true, temperatura: 0 };
    }

    const [alarme, pre_alarme, ativo, temperatura] = dados.pendulos[numero];
    return { alarme, pre_alarme, ativo, temperatura };
  }, [dados, numero]);

  const alturaArmazem = 6;
  const espacamentoSensores = sensoresArco.length > 1 ? 
    (alturaArmazem * 0.8) / sensoresArco.length : 
    alturaArmazem * 0.4;

  return (
    <group ref={grupoRef} position={position}>
      {/* Cabo principal */}
      <mesh position={[0, alturaArmazem / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, alturaArmazem, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Sensores ao longo do cabo */}
      {sensoresArco.map((sensor, index) => {
        const yPos = alturaArmazem * 0.9 - (index * espacamentoSensores);
        const cor = sensor.ativo ? corFaixaExata(sensor.temperatura) : "#666666";

        return (
          <group key={sensor.id} position={[0, yPos, 0]}>
            {/* Sensor */}
            <mesh>
              <boxGeometry args={[0.12, 0.06, 0.06]} />
              <meshStandardMaterial
                color={cor}
                emissive={sensor.falha ? "#ff0000" : sensor.ponto_quente ? "#ffaa00" : "#000000"}
                emissiveIntensity={sensor.falha ? 0.4 : sensor.ponto_quente ? 0.2 : 0}
              />
            </mesh>

            {/* Display da temperatura */}
            <Billboard position={[0.25, 0, 0]}>
              <Text
                fontSize={0.06}
                color={sensor.falha ? "#ff0000" : sensor.ativo ? "#ffffff" : "#666666"}
                anchorX="center"
                anchorY="middle"
              >
                {sensor.falha ? "ERR" : !sensor.ativo ? "OFF" : `${sensor.temperatura.toFixed(1)}°C`}
              </Text>
            </Billboard>
          </group>
        );
      })}

      {/* Peso na extremidade */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.03, 0.1, 8]} />
        <meshStandardMaterial 
          color={dadosBasicos.alarme ? "#ff0000" : dadosBasicos.pre_alarme ? "#ffaa00" : "#444444"}
          emissive={dadosBasicos.alarme ? "#ff0000" : dadosBasicos.pre_alarme ? "#ffaa00" : "#000000"}
          emissiveIntensity={dadosBasicos.alarme ? 0.3 : dadosBasicos.pre_alarme ? 0.2 : 0}
        />
      </mesh>

      {/* Nome do pêndulo */}
      <Billboard position={[0, 0.1, 0]}>
        <Text
          fontSize={0.1}
          color={dadosBasicos.alarme ? "#ff0000" : dadosBasicos.ativo ? "#ffffff" : "#666666"}
          anchorX="center"
          anchorY="middle"
        >
          P{numero}
        </Text>
      </Billboard>
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
      heliceRef.current.rotation.y += delta * 10;
    }
  });

  return (
    <group ref={grupoRef} position={position}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.25, 0.1, 12]} />
        <meshStandardMaterial color={cores[status] || cores[0]} />
      </mesh>

      <group ref={heliceRef} position={[0, 0.1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.03, 0.02, 6]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        {[0, 120, 240].map((angle, index) => (
          <mesh
            key={index}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.1,
              0,
              Math.sin((angle * Math.PI) / 180) * 0.1,
            ]}
            rotation={[0, (angle * Math.PI) / 180, 0]}
          >
            <boxGeometry args={[0.15, 0.015, 0.03]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
        ))}
      </group>

      <Billboard position={[0, 0.05, 0.2]}>
        <Text fontSize={0.04} color="white" anchorX="center" anchorY="middle">
          AE-{id}
        </Text>
      </Billboard>
    </group>
  );
};

const ArmazemStructure3D = ({ numeroArcos, alturaArmazem, larguraArmazem, profundidadeArmazem, config3D }) => {
  const configArmazem = config3D || {
    pb: 185,
    lb: 350,
    hb: 30,
    hf: 5,
    lf: 250,
    le: 15,
    ht: 50,
    tipo_telhado: 1,
    tipo_fundo: 0,
    intensidade_fundo: 20,
    curvatura_topo: 30,
  };

  const escala3D = 0.03;
  const largura3D = configArmazem.lb * escala3D;
  const altura3D = configArmazem.pb * escala3D;
  const alturaBase = configArmazem.hb * escala3D;
  const alturaTelhado = configArmazem.ht * escala3D;
  const larguraFrente = configArmazem.lf * escala3D;

  const corTelhado = "#E6E6E6";
  const corBase = "#999999";

  return (
    <group>
      {/* Base/Fundo do armazém */}
      <group position={[0, alturaBase / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[largura3D, alturaBase, profundidadeArmazem]} />
          <meshStandardMaterial color={corBase} roughness={0.8} metalness={0.2} />
        </mesh>
      </group>

      {/* Paredes laterais */}
      <group position={[0, altura3D / 2, 0]}>
        <mesh position={[-largura3D / 2 - 0.1, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, altura3D, profundidadeArmazem]} />
          <meshStandardMaterial color={corTelhado} transparent opacity={0.8} />
        </mesh>

        <mesh position={[largura3D / 2 + 0.1, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, altura3D, profundidadeArmazem]} />
          <meshStandardMaterial color={corTelhado} transparent opacity={0.8} />
        </mesh>

        <mesh position={[0, 0, -profundidadeArmazem / 2 - 0.1]} castShadow receiveShadow>
          <boxGeometry args={[larguraFrente, altura3D * 0.8, 0.2]} />
          <meshStandardMaterial color={corTelhado} transparent opacity={0.7} />
        </mesh>

        <mesh position={[0, 0, profundidadeArmazem / 2 + 0.1]} castShadow receiveShadow>
          <boxGeometry args={[larguraFrente, altura3D * 0.8, 0.2]} />
          <meshStandardMaterial color={corTelhado} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Telhado */}
      <group position={[0, altura3D + alturaBase, 0]}>
        <mesh position={[0, alturaTelhado / 2, -profundidadeArmazem / 4]} rotation={[-Math.PI / 6, 0, 0]} castShadow>
          <boxGeometry args={[largura3D + 0.4, 0.1, profundidadeArmazem / 2 + 0.2]} />
          <meshStandardMaterial color={corTelhado} metalness={0.1} roughness={0.8} />
        </mesh>

        <mesh position={[0, alturaTelhado / 2, profundidadeArmazem / 4]} rotation={[Math.PI / 6, 0, 0]} castShadow>
          <boxGeometry args={[largura3D + 0.4, 0.1, profundidadeArmazem / 2 + 0.2]} />
          <meshStandardMaterial color={corTelhado} metalness={0.1} roughness={0.8} />
        </mesh>

        <mesh position={[0, alturaTelhado + 0.05, 0]} castShadow>
          <boxGeometry args={[largura3D + 0.5, 0.1, 0.1]} />
          <meshStandardMaterial color={corBase} metalness={0.2} roughness={0.7} />
        </mesh>
      </group>

      {/* Vigas estruturais dos arcos */}
      <Instances>
        <boxGeometry args={[0.08, altura3D + alturaBase, 0.08]} />
        <meshStandardMaterial color="#999999" metalness={0.6} roughness={0.4} />
        {Array.from({ length: numeroArcos }, (_, i) => {
          const x = -largura3D / 2 + ((i + 1) * largura3D) / (numeroArcos + 1);
          return (
            <Instance key={i} position={[x, (altura3D + alturaBase) / 2, 0]} />
          );
        })}
      </Instances>

      {/* Marcação dos arcos */}
      {Array.from({ length: numeroArcos }, (_, i) => {
        const x = -largura3D / 2 + ((i + 1) * largura3D) / (numeroArcos + 1);
        return (
          <Billboard key={i} position={[x, altura3D + alturaBase + 0.3, 0]}>
            <Text fontSize={0.08} color="#333333" anchorX="center" anchorY="middle">
              Arco {i + 1}
            </Text>
          </Billboard>
        );
      })}
    </group>
  );
};

const ArmazemCompleto3D = ({ dados, config3D }) => {
  const alturaArmazem = 6;
  const numeroArcos = 19;
  const larguraArmazem = numeroArcos * 2;
  const profundidadeArmazem = 6;

  // Processar pêndulos baseado na estrutura real dos dados
  const pendulosData = useMemo(() => {
    const pendulos = [];

    if (dados.arcos) {
      Object.entries(dados.arcos).forEach(([arcoNum, arcoData]) => {
        const arcoNumero = parseInt(arcoNum);

        Object.entries(arcoData).forEach(([penduloNum, sensores]) => {
          const numeroPendulo = parseInt(penduloNum);

          // Calcular posição baseada no arco
          const arcoX = -larguraArmazem / 2 + (arcoNumero * larguraArmazem) / (numeroArcos + 1);

          // Distribuir pêndulos dentro do arco
          const pendulosNoArco = Object.keys(arcoData).length;
          const indicePendulo = Object.keys(arcoData).indexOf(penduloNum);
          const posZ = pendulosNoArco > 1 ? 
            -profundidadeArmazem / 4 + (indicePendulo * profundidadeArmazem / 2) / (pendulosNoArco - 1) : 
            0;

          pendulos.push({
            numero: numeroPendulo,
            arco: arcoNumero,
            position: [arcoX, 0, posZ],
            sensores: sensores
          });
        });
      });
    }

    return pendulos;
  }, [dados, larguraArmazem, numeroArcos, profundidadeArmazem]);

  // Processar motores/aeradores
  const motoresData = useMemo(() => {
    const motores = [];

    if (dados.configuracao?.layout_topo?.aeradores) {
      Object.entries(dados.configuracao.layout_topo.aeradores).forEach(([aeradorId, dadosAerador]) => {
        const [posX2D, posY2D] = dadosAerador;

        // Converter coordenadas 2D para 3D
        const posX3D = -larguraArmazem / 2 + (posX2D / 600) * larguraArmazem;
        const posZ3D = (posY2D < 200) ? profundidadeArmazem / 2 + 0.5 : -profundidadeArmazem / 2 - 0.5;

        motores.push({
          id: parseInt(aeradorId),
          position: [posX3D, alturaArmazem + 0.2, posZ3D],
          status: Math.random() > 0.5 ? 3 : 0
        });
      });
    }

    return motores;
  }, [dados, larguraArmazem, profundidadeArmazem, alturaArmazem]);

  return (
    <group>
      {/* Estrutura do armazém */}
      <ArmazemStructure3D
        numeroArcos={numeroArcos}
        alturaArmazem={alturaArmazem}
        larguraArmazem={larguraArmazem}
        profundidadeArmazem={profundidadeArmazem}
        config3D={config3D}
      />

      {/* Pêndulos */}
      {pendulosData.map((pendulo, index) => (
        <Pendulo3D
          key={`${pendulo.arco}-${pendulo.numero}`}
          position={pendulo.position}
          numero={pendulo.numero}
          dados={dados}
          arcoNumero={pendulo.arco}
        />
      ))}

      {/* Motores/Aeradores */}
      {motoresData.map((motor, index) => (
        <Motor3D
          key={`motor-${motor.id}`}
          position={motor.position}
          id={motor.id}
          status={motor.status}
        />
      ))}

      {/* Iluminação interna */}
      <pointLight position={[0, alturaArmazem * 0.8, 0]} intensity={0.5} distance={20} />
      <pointLight position={[-larguraArmazem / 4, alturaArmazem * 0.6, 0]} intensity={0.3} distance={15} />
      <pointLight position={[larguraArmazem / 4, alturaArmazem * 0.6, 0]} intensity={0.3} distance={15} />
    </group>
  );
};

const Armazem3D = () => {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [config3D, setConfig3D] = useState(null);

  const alturaArmazem = 6;
  const larguraArmazem = 19 * 2;

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        const response = await fetch("/attached_assets/modeloRotaArmazemPortal_1751897945212.json");
        const dadosCarregados = await response.json();
        setDados(dadosCarregados);

        const configArmazemSalva = localStorage.getItem("configArmazem");
        if (configArmazemSalva) {
          const configParsed = JSON.parse(configArmazemSalva);
          setConfig3D(configParsed);
        } else {
          setConfig3D({
            pb: 185,
            lb: 350,
            hb: 30,
            hf: 5,
            lf: 250,
            le: 15,
            ht: 50,
            tipo_telhado: 1,
            tipo_fundo: 0,
            intensidade_fundo: 20,
            curvatura_topo: 30,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  if (carregando || !dados) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "18px" 
      }}>
        Carregando Armazém 3D...
      </div>
    );
  }

  // Calcular estatísticas reais
  const totalPendulos = dados.pendulos ? Object.keys(dados.pendulos).length : 0;
  const totalArcos = dados.arcos ? Object.keys(dados.arcos).length : 0;
  const totalAeradores = dados.configuracao?.layout_topo?.aeradores ? 
    Object.keys(dados.configuracao.layout_topo.aeradores).length : 0;

  // Calcular total de sensores
  const totalSensores = useMemo(() => {
    let count = 0;
    if (dados.arcos) {
      Object.values(dados.arcos).forEach(arco => {
        Object.values(arco).forEach(pendulo => {
          count += Object.keys(pendulo).length;
        });
      });
    }
    return count;
  }, [dados]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {/* Controles */}
      <div style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        zIndex: 1000,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        fontSize: "14px"
      }}>
        <div><strong>Armazém 3D - Dados Reais</strong></div>
        <hr style={{ margin: "10px 0" }} />
        <div>Arcos: {totalArcos}</div>
        <div>Pêndulos: {totalPendulos}</div>
        <div>Sensores: {totalSensores}</div>
        <div>Células: 3</div>
        <div>Aeradores: {totalAeradores}</div>

        <div style={{ marginTop: "15px" }}>
          <label>
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
            />
            {" "}Rotação Automática
          </label>
          <button
            onClick={() => {
              const configArmazemSalva = localStorage.getItem("configArmazem");
              if (configArmazemSalva) {
                setConfig3D(JSON.parse(configArmazemSalva));
                alert("Configurações do ModeladorSVG recarregadas!");
              } else {
                alert("Nenhuma configuração encontrada no ModeladorSVG.");
              }
            }}
            style={{ 
              marginLeft: "10px", 
              padding: "5px 10px", 
              fontSize: "12px", 
              color: "black", 
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Sincronizar com ModeladorSVG
          </button>
        </div>
      </div>

      {/* Canvas 3D */}
      <Canvas
        camera={{
          position: [larguraArmazem * 0.8, alturaArmazem * 1.5, larguraArmazem * 0.5],
          fov: 60,
        }}
        style={{
          height: "100%",
          background: "linear-gradient(to bottom, #87CEEB, #E0F6FF)",
        }}
        shadows
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[20, 15, 10]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight
          position={[-10, 10, -5]}
          intensity={0.5}
          color="#fff8dc"
        />

        <ArmazemCompleto3D dados={dados} config3D={config3D} />

        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={60}
          target={[0, alturaArmazem / 2, 0]}
        />
      </Canvas>
    </div>
  );
};

export default Armazem3D;