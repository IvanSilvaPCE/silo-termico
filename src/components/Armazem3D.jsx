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
  // Calcular altura do cabo baseado na quantidade de sensores - começando do topo
  const alturaCabo = Math.max(2, sensoresArco.length * 0.4 + 1.5);
  const alturaMinima = 1.0; // Altura mínima do chão que o cabo deve manter
  const espacamentoSensores = sensoresArco.length > 1 ? 
    (alturaCabo - alturaMinima) / sensoresArco.length : 
    (alturaCabo - alturaMinima) * 0.5;

  return (
    <group ref={grupoRef} position={position}>
      {/* Cabo principal - do teto até altura mínima */}
      <mesh position={[0, alturaArmazem - (alturaCabo / 2), 0]}>
        <cylinderGeometry args={[0.02, 0.02, alturaCabo, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Sensores ao longo do cabo */}
      {sensoresArco.map((sensor, index) => {
        const yPos = alturaArmazem - 0.2 - (index * espacamentoSensores);
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
                outlineWidth={0.02}
                outlineColor="#000000"
              >
                <meshBasicMaterial 
                  attach="material" 
                  transparent 
                  depthTest={false}
                  depthWrite={false}
                />
                {sensor.falha ? "ERR" : !sensor.ativo ? "OFF" : `${sensor.temperatura.toFixed(1)}°C`}
              </Text>
            </Billboard>
          </group>
        );
      })}

      {/* Peso na extremidade */}
      <mesh position={[0, alturaArmazem - alturaCabo + alturaMinima, 0]}>
        <cylinderGeometry args={[0.04, 0.03, 0.1, 8]} />
        <meshStandardMaterial 
          color={dadosBasicos.alarme ? "#ff0000" : dadosBasicos.pre_alarme ? "#ffaa00" : "#444444"}
          emissive={dadosBasicos.alarme ? "#ff0000" : dadosBasicos.pre_alarme ? "#ffaa00" : "#000000"}
          emissiveIntensity={dadosBasicos.alarme ? 0.3 : dadosBasicos.pre_alarme ? 0.2 : 0}
        />
      </mesh>

      {/* Nome do pêndulo */}
      <Billboard position={[0, alturaArmazem - alturaCabo + alturaMinima - 0.2, 0]}>
        <Text
          fontSize={0.1}
          color={dadosBasicos.alarme ? "#ff0000" : dadosBasicos.ativo ? "#ffffff" : "#666666"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          <meshBasicMaterial 
            attach="material" 
            transparent 
            depthTest={false}
            depthWrite={false}
          />
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

  const corTelhado = "#E6E6E6";
  const corBase = "#999999";
  const corParede = "#D0D0D0";
  const espessuraParede = 0.15;

  return (
    <group>
      {/* Base/Piso do armazém */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[larguraArmazem + espessuraParede, 0.1, profundidadeArmazem + espessuraParede]} />
        <meshStandardMaterial color={corBase} roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Paredes laterais (esquerda e direita) */}
      <mesh position={[-larguraArmazem / 2, alturaArmazem / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[espessuraParede, alturaArmazem, profundidadeArmazem]} />
        <meshStandardMaterial color={corParede} transparent opacity={0.3} />
      </mesh>

      <mesh position={[larguraArmazem / 2, alturaArmazem / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[espessuraParede, alturaArmazem, profundidadeArmazem]} />
        <meshStandardMaterial color={corParede} transparent opacity={0.3} />
      </mesh>

      {/* Paredes frontais (frente e fundo) */}
      <mesh position={[0, alturaArmazem / 2, -profundidadeArmazem / 2]} castShadow receiveShadow>
        <boxGeometry args={[larguraArmazem, alturaArmazem, espessuraParede]} />
        <meshStandardMaterial color={corParede} transparent opacity={0.3} />
      </mesh>

      <mesh position={[0, alturaArmazem / 2, profundidadeArmazem / 2]} castShadow receiveShadow>
        <boxGeometry args={[larguraArmazem, alturaArmazem, espessuraParede]} />
        <meshStandardMaterial color={corParede} transparent opacity={0.3} />
      </mesh>

      {/* Telhado em duas águas - mais baixo e estendido para os lados */}
      <mesh position={[0, alturaArmazem + 0.15, -profundidadeArmazem / 4]} rotation={[-Math.PI / 12, 0, 0]} castShadow>
        <boxGeometry args={[larguraArmazem + 1.5, 0.1, profundidadeArmazem / 2 + 0.3]} />
        <meshStandardMaterial color={corTelhado} metalness={0.1} roughness={0.8} />
      </mesh>

      <mesh position={[0, alturaArmazem + 0.15, profundidadeArmazem / 4]} rotation={[Math.PI / 12, 0, 0]} castShadow>
        <boxGeometry args={[larguraArmazem + 1.5, 0.1, profundidadeArmazem / 2 + 0.3]} />
        <meshStandardMaterial color={corTelhado} metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Cumeeira do telhado */}
      <mesh position={[0, alturaArmazem + 0.25, 0]} castShadow>
        <boxGeometry args={[larguraArmazem + 1.6, 0.1, 0.15]} />
        <meshStandardMaterial color={corBase} metalness={0.2} roughness={0.7} />
      </mesh>

      {/* Vigas estruturais internas (apenas algumas principais) */}
      <Instances>
        <boxGeometry args={[0.06, alturaArmazem, 0.06]} />
        <meshStandardMaterial color="#999999" metalness={0.6} roughness={0.4} />
        {Array.from({ length: Math.min(5, numeroArcos) }, (_, i) => {
          const espacamento = larguraArmazem / (Math.min(5, numeroArcos) + 1);
          const x = -larguraArmazem / 2 + (i + 1) * espacamento;
          return (
            <Instance key={i} position={[x, alturaArmazem / 2, 0]} />
          );
        })}
      </Instances>

      {/* Marcação das células no chão */}
      <Billboard position={[-larguraArmazem / 3, 0.1, -profundidadeArmazem / 3]}>
        <Text fontSize={0.15} color="#0066cc" anchorX="center" anchorY="middle">
          CÉLULA 1
        </Text>
      </Billboard>
      <Billboard position={[0, 0.1, -profundidadeArmazem / 3]}>
        <Text fontSize={0.15} color="#0066cc" anchorX="center" anchorY="middle">
          CÉLULA 2
        </Text>
      </Billboard>
      <Billboard position={[larguraArmazem / 3, 0.1, -profundidadeArmazem / 3]}>
        <Text fontSize={0.15} color="#0066cc" anchorX="center" anchorY="middle">
          CÉLULA 3
        </Text>
      </Billboard>

      {/* Marcação dos arcos no teto */}
      {Array.from({ length: numeroArcos }, (_, i) => {
        const espacamento = larguraArmazem / (numeroArcos + 1);
        const x = -larguraArmazem / 2 + (i + 1) * espacamento;
        return (
          <Billboard key={i} position={[x, alturaArmazem + 0.8, 0]}>
            <Text fontSize={0.06} color="#333333" anchorX="center" anchorY="middle">
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
  
  // Usar dados do layout_topo para distribuição mais precisa
  const layoutTopo = dados?.configuracao?.layout_topo;
  const numeroArcos = layoutTopo ? Object.keys(layoutTopo).filter(key => key !== 'celulas' && key !== 'aeradores').length : 19;
  
  // Calcular dimensões baseadas no layout topo
  const larguraArmazem = Math.max(numeroArcos * 1.2, 20); // Mais espaço para arcos
  const profundidadeArmazem = 10; // Mais profundidade para melhor distribuição

  // Processar pêndulos baseado no layout_topo (similar à visão topo)
  const pendulosData = useMemo(() => {
    const pendulos = [];

    if (layoutTopo) {
      Object.entries(layoutTopo).forEach(([arcoKey, arcoData]) => {
        if (arcoKey === 'celulas' || arcoKey === 'aeradores') return;

        const arcoNumero = parseInt(arcoKey);
        const celula = arcoData.celula;
        const posXTopo = arcoData.pos_x;
        const sensoresArco = arcoData.sensores || {};

        // Converter posição X do topo (0-600) para 3D
        const posX3D = -larguraArmazem / 2 + (posXTopo / 600) * larguraArmazem;

        // Distribuir pêndulos dentro do arco baseado nos sensores
        Object.entries(sensoresArco).forEach(([penduloId, posYTopo]) => {
          const numeroPendulo = parseInt(penduloId);
          
          // Converter posição Y do topo para posição Z no 3D
          // Posições Y no topo (50-300) representam profundidade no 3D
          const posZ3D = -profundidadeArmazem / 2 + ((posYTopo - 50) / 250) * (profundidadeArmazem - 2) + 1;

          // Buscar dados do pêndulo nos arcos detalhados
          const dadosPendulo = dados?.arcos?.[arcoNumero]?.[numeroPendulo];

          pendulos.push({
            numero: numeroPendulo,
            arco: arcoNumero,
            celula: celula,
            position: [posX3D, 0, posZ3D],
            sensores: dadosPendulo || {},
            posicaoOriginal: { x: posXTopo, y: posYTopo }
          });
        });
      });
    }

    return pendulos;
  }, [dados, layoutTopo, larguraArmazem, profundidadeArmazem]);

  // Processar motores/aeradores baseado no layout_topo - SEMPRE FORA do armazém
  const motoresData = useMemo(() => {
    const motores = [];
    const margemExterna = 1.5; // Distância mínima das paredes

    if (layoutTopo?.aeradores) {
      Object.entries(layoutTopo.aeradores).forEach(([aeradorId, dadosAerador]) => {
        const [posX2D, posY2D, tipo] = dadosAerador;

        // Converter coordenadas 2D para 3D
        let posX3D = -larguraArmazem / 2 + (posX2D / 600) * larguraArmazem;
        let posZ3D = -profundidadeArmazem / 2 + (posY2D / 400) * profundidadeArmazem;
        
        // GARANTIR que motores fiquem FORA das paredes
        // Se dentro dos limites do armazém, empurrar para fora
        if (Math.abs(posX3D) < larguraArmazem / 2 + 0.5) {
          if (posX3D >= 0) {
            posX3D = larguraArmazem / 2 + margemExterna;
          } else {
            posX3D = -larguraArmazem / 2 - margemExterna;
          }
        }
        
        if (Math.abs(posZ3D) < profundidadeArmazem / 2 + 0.5) {
          if (posZ3D >= 0) {
            posZ3D = profundidadeArmazem / 2 + margemExterna;
          } else {
            posZ3D = -profundidadeArmazem / 2 - margemExterna;
          }
        }

        // Posicionar motores nos cantos ou nas bordas externas
        const cantos = [
          [-larguraArmazem / 2 - margemExterna, -profundidadeArmazem / 2 - margemExterna],
          [larguraArmazem / 2 + margemExterna, -profundidadeArmazem / 2 - margemExterna],
          [-larguraArmazem / 2 - margemExterna, profundidadeArmazem / 2 + margemExterna],
          [larguraArmazem / 2 + margemExterna, profundidadeArmazem / 2 + margemExterna]
        ];

        // Distribuir motores nos cantos ou bordas
        const indiceMotor = parseInt(aeradorId) - 1;
        const totalMotores = Object.keys(layoutTopo.aeradores).length;
        
        if (indiceMotor < 4) {
          // Primeiros 4 motores nos cantos
          [posX3D, posZ3D] = cantos[indiceMotor];
        } else {
          // Demais motores nas bordas
          const laterais = indiceMotor % 4;
          switch (laterais) {
            case 0: // Borda superior
              posX3D = -larguraArmazem / 2 + (indiceMotor / totalMotores) * larguraArmazem;
              posZ3D = -profundidadeArmazem / 2 - margemExterna;
              break;
            case 1: // Borda direita
              posX3D = larguraArmazem / 2 + margemExterna;
              posZ3D = -profundidadeArmazem / 2 + (indiceMotor / totalMotores) * profundidadeArmazem;
              break;
            case 2: // Borda inferior
              posX3D = larguraArmazem / 2 - (indiceMotor / totalMotores) * larguraArmazem;
              posZ3D = profundidadeArmazem / 2 + margemExterna;
              break;
            case 3: // Borda esquerda
              posX3D = -larguraArmazem / 2 - margemExterna;
              posZ3D = profundidadeArmazem / 2 - (indiceMotor / totalMotores) * profundidadeArmazem;
              break;
          }
        }

        motores.push({
          id: parseInt(aeradorId),
          position: [posX3D, 0.3, posZ3D], // Altura baixa, no nível do solo
          status: Math.random() > 0.5 ? 3 : 0,
          tipo: tipo || 0
        });
      });
    }

    return motores;
  }, [dados, layoutTopo, larguraArmazem, profundidadeArmazem]);

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
  
  // Calcular largura baseada nos dados reais quando disponíveis
  const numeroArcos = dados?.arcos ? Object.keys(dados.arcos).length : 19;
  const totalPendulosCalculado = dados?.pendulos ? Object.keys(dados.pendulos).length : 0;
  const larguraArmazem = Math.max(numeroArcos * 1.5, totalPendulosCalculado * 0.8, 15);

  // Calcular total de sensores
  const totalSensores = useMemo(() => {
    let count = 0;
    if (dados?.arcos) {
      Object.values(dados.arcos).forEach(arco => {
        Object.values(arco).forEach(pendulo => {
          count += Object.keys(pendulo).length;
        });
      });
    }
    return count;
  }, [dados]);

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

  // Calcular estatísticas reais baseadas no layout_topo
  const layoutTopo = dados?.configuracao?.layout_topo;
  const totalArcos = layoutTopo ? Object.keys(layoutTopo).filter(key => key !== 'celulas' && key !== 'aeradores').length : 0;
  
  let totalPendulos = 0;
  let totalSensoresPorCelula = { 1: 0, 2: 0, 3: 0 };
  
  if (layoutTopo) {
    Object.entries(layoutTopo).forEach(([arcoKey, arcoData]) => {
      if (arcoKey === 'celulas' || arcoKey === 'aeradores') return;
      
      const sensores = arcoData.sensores || {};
      const celula = arcoData.celula;
      const numSensores = Object.keys(sensores).length;
      
      totalPendulos += numSensores;
      if (celula >= 1 && celula <= 3) {
        totalSensoresPorCelula[celula] += numSensores;
      }
    });
  }
  
  const totalAeradores = layoutTopo?.aeradores ? Object.keys(layoutTopo.aeradores).length : 0;

  

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {/* Controles */}
      <div style={{
        position: "absolute",
        bottom: "10px",
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
        <div>Aeradores: {totalAeradores}</div>
        <hr style={{ margin: "10px 0" }} />
        <div><strong>Por Célula:</strong></div>
        <div>Célula 1: {totalSensoresPorCelula[1]} sensores</div>
        <div>Célula 2: {totalSensoresPorCelula[2]} sensores</div>
        <div>Célula 3: {totalSensoresPorCelula[3]} sensores</div>

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