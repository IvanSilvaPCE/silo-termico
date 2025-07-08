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

  // Calcular posicionamento vertical dos sensores
  const sensoresArray = Object.entries(sensores).map(([key, valores]) => ({
    numero: parseInt(key),
    temperatura: valores[0],
    ponto_quente: valores[1],
    pre_alarme: valores[2],
    falha: valores[3],
    ativo: valores[4]
  }));

  // Ordenar sensores por número para posicionamento correto
  sensoresArray.sort((a, b) => a.numero - b.numero);

  const espacamentoSensores = (alturaArmazem * 0.7) / (sensoresArray.length + 1);

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

      {/* Sensores ao longo do cabo */}
      {sensoresArray.map((sensor, index) => {
        const yPos = alturaArmazem * 0.85 - (index + 1) * espacamentoSensores;
        const cor = sensor.ativo ? corFaixaExata(sensor.temperatura) : "#cccccc";

        return (
          <group key={sensor.numero} position={[0, yPos, 0]}>
            {/* Corpo do sensor */}
            <mesh>
              <boxGeometry args={[0.25, 0.12, 0.12]} />
              <meshStandardMaterial
                color={cor}
                emissive={sensor.falha ? "#ff0000" : sensor.ponto_quente ? "#ffaa00" : cor}
                emissiveIntensity={
                  sensor.falha ? 0.5 : sensor.ponto_quente ? 0.3 : sensor.ativo ? 0.2 : 0.1
                }
                metalness={0.3}
                roughness={0.7}
                opacity={sensor.ativo ? 1.0 : 0.5}
                transparent={!sensor.ativo}
              />
            </mesh>

            {/* Antena do sensor */}
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.08, 8]} />
              <meshStandardMaterial
                color={sensor.ativo ? "#666666" : "#999999"}
                opacity={sensor.ativo ? 1.0 : 0.5}
                transparent={!sensor.ativo}
              />
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

      {/* Hélices */}
      <group ref={heliceRef} position={[0, 0.3, 0]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.06, 0.04, 8]} />
          <meshStandardMaterial
            color="#2c2c2c"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

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

      {/* LED indicador */}
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
  config3D,
}) => {
  const larguraArco = 3.5;
  const larguraArmazem = numeroArcos * larguraArco;
  const profundidadeArmazem = 8;

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
        {configArmazem.tipo_fundo === 0 && (
          <mesh receiveShadow>
            <boxGeometry args={[largura3D, alturaBase, profundidadeArmazem]} />
            <meshStandardMaterial color={corBase} roughness={0.8} metalness={0.2} />
          </mesh>
        )}

        {configArmazem.tipo_fundo === 1 && (
          <group>
            <mesh position={[-largura3D / 4, 0, 0]} rotation={[0, 0, Math.PI / 12]}>
              <boxGeometry args={[largura3D / 2, alturaBase, profundidadeArmazem]} />
              <meshStandardMaterial color={corBase} roughness={0.8} metalness={0.2} />
            </mesh>
            <mesh position={[largura3D / 4, 0, 0]} rotation={[0, 0, -Math.PI / 12]}>
              <boxGeometry args={[largura3D / 2, alturaBase, profundidadeArmazem]} />
              <meshStandardMaterial color={corBase} roughness={0.8} metalness={0.2} />
            </mesh>
          </group>
        )}

        {configArmazem.tipo_fundo === 2 && (
          // Duplo V (como no 2D)
          <group>
            {/* Primeira seção V */}
            <mesh position={[-largura3D / 3, 0, 0]} rotation={[0, 0, Math.PI / 15]}>
              <boxGeometry args={[largura3D / 3, alturaBase, profundidadeArmazem]} />
              <meshStandardMaterial color={corBase} roughness={0.8} metalness={0.2} />
            </mesh>
            {/* Segunda seção V */}
            <mesh position={[largura3D / 3, 0, 0]} rotation={[0, 0, -Math.PI / 15]}>
              <boxGeometry args={[largura3D / 3, alturaBase, profundidadeArmazem]} />
              <meshStandardMaterial color={corBase} roughness={0.8} metalness={0.2} />
            </mesh>
            {/* Seção central */}
            <mesh position={[0, alturaBase / 4, 0]}>
              <boxGeometry args={[largura3D / 3, alturaBase / 2, profundidadeArmazem]} />
              <meshStandardMaterial color={corBase} roughness={0.8} metalness={0.2} />
            </mesh>
          </group>
        )}
      </group>

      {/* Paredes laterais */}
      <group position={[0, altura3D / 2, 0]}>
        <mesh
          position={[-largura3D / 2 - 0.1, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.2, altura3D, profundidadeArmazem]} />
          <meshStandardMaterial
            color={corTelhado}
            transparent
            opacity={0.8}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        <mesh
          position={[largura3D / 2 + 0.1, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.2, altura3D, profundidadeArmazem]} />
          <meshStandardMaterial
            color={corTelhado}
            transparent
            opacity={0.8}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        <mesh
          position={[0, 0, -profundidadeArmazem / 2 - 0.1]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[larguraFrente, altura3D * 0.8, 0.2]} />
          <meshStandardMaterial
            color={corTelhado}
            transparent
            opacity={0.7}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        <mesh
          position={[0, 0, profundidadeArmazem / 2 + 0.1]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[larguraFrente, altura3D * 0.8, 0.2]} />
          <meshStandardMaterial
            color={corTelhado}
            transparent
            opacity={0.7}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Telhado */}
      <group position={[0, altura3D + alturaBase, 0]}>
        {configArmazem.tipo_telhado === 1 && (
          <>
            <mesh
              position={[0, alturaTelhado / 2, -profundidadeArmazem / 4]}
              rotation={[-Math.PI / 6, 0, 0]}
              castShadow
            >
              <boxGeometry
                args={[largura3D + 0.4, 0.1, profundidadeArmazem / 2 + 0.2]}
              />
              <meshStandardMaterial
                color={corTelhado}
                metalness={0.1}
                roughness={0.8}
              />
            </mesh>

            <mesh
              position={[0, alturaTelhado / 2, profundidadeArmazem / 4]}
              rotation={[Math.PI / 6, 0, 0]}
              castShadow
            >
              <boxGeometry
                args={[largura3D + 0.4, 0.1, profundidadeArmazem / 2 + 0.2]}
              />
              <meshStandardMaterial
                color={corTelhado}
                metalness={0.1}
                roughness={0.8}
              />
            </mesh>

            {/* Cumeeira pontuda */}
            <mesh position={[0, alturaTelhado + 0.05, 0]} castShadow>
              <boxGeometry args={[largura3D + 0.5, 0.1, 0.1]} />
              <meshStandardMaterial
                color={corBase}
                metalness={0.2}
                roughness={0.7}
              />
            </mesh>
          </>
        )}

        {configArmazem.tipo_telhado === 2 && (
          // Telhado arredondado (baseado no 2D)
          <>
            <mesh
              position={[0, alturaTelhado / 3, -profundidadeArmazem / 4]}
              rotation={[-Math.PI / 8, 0, 0]}
              castShadow
            >
              <boxGeometry
                args={[largura3D + 0.4, 0.1, profundidadeArmazem / 2 + 0.2]}
              />
              <meshStandardMaterial
                color={corTelhado}
                metalness={0.1}
                roughness={0.8}
              />
            </mesh>

            <mesh
              position={[0, alturaTelhado / 3, profundidadeArmazem / 4]}
              rotation={[Math.PI / 8, 0, 0]}
              castShadow
            >
              <boxGeometry
                args={[largura3D + 0.4, 0.1, profundidadeArmazem / 2 + 0.2]}
              />
              <meshStandardMaterial
                color={corTelhado}
                metalness={0.1}
                roughness={0.8}
              />
            </mesh>

            {/* Cumeeira arredondada */}
            <mesh position={[0, alturaTelhado / 2, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, largura3D + 0.5, 16]} />
              <meshStandardMaterial
                color={corBase}
                metalness={0.2}
                roughness={0.7}
              />
            </mesh>
          </>
        )}

        {configArmazem.tipo_telhado === 3 && (
          // Telhado em arco (baseado no 2D)
          <>
            <mesh
              position={[0, alturaTelhado / 4, -profundidadeArmazem / 4]}
              rotation={[-Math.PI / 10, 0, 0]}
              castShadow
            >
              <boxGeometry
                args={[largura3D + 0.4, 0.1, profundidadeArmazem / 2 + 0.2]}
              />
              <meshStandardMaterial
                color={corTelhado}
                metalness={0.1}
                roughness={0.8}
              />
            </mesh>

            <mesh
              position={[0, alturaTelhado / 4, profundidadeArmazem / 4]}
              rotation={[Math.PI / 10, 0, 0]}
              castShadow
            >
              <boxGeometry
                args={[largura3D + 0.4, 0.1, profundidadeArmazem / 2 + 0.2]}
              />
              <meshStandardMaterial
                color={corTelhado}
                metalness={0.1}
                roughness={0.8}
              />
            </mesh>

            {/* Cumeeira em arco */}
            <mesh position={[0, alturaTelhado / 3, 0]} castShadow>
              <torusGeometry args={[largura3D / 4, 0.05, 8, 16, Math.PI]} />
              <meshStandardMaterial
                color={corBase}
                metalness={0.2}
                roughness={0.7}
              />
            </mesh>
          </>
        )}
      </group>

      {/* Vigas estruturais */}
      <Instances>
        <boxGeometry args={[0.08, altura3D + alturaBase, 0.08]} />
        <meshStandardMaterial
          color="#999999"
          metalness={0.6}
          roughness={0.4}
        />
        {Array.from({ length: numeroArcos + 1 }, (_, i) => {
          const x = -largura3D / 2 + (i * largura3D) / numeroArcos;
          const isSelected = i === arcoSelecionado;

          return (
            <Instance
              key={i}
              position={[x, (altura3D + alturaBase) / 2, 0]}
              color={isSelected ? "#FF6B35" : "#999999"}
            />
          );
        })}
      </Instances>

      {/* Labels para arcos selecionados */}
      {arcoSelecionado && (
        <Billboard
          position={[
            -largura3D / 2 + (arcoSelecionado - 1) * (largura3D / numeroArcos) + (largura3D / numeroArcos) / 2,
            altura3D + alturaBase + alturaTelhado + 0.8,
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

      {/* Highlight do arco selecionado */}
      {tipoSelecao === "arco" &&
        arcoSelecionado &&
        arcoSelecionado <= numeroArcos && (
          <mesh
            position={[
              -largura3D / 2 + (arcoSelecionado - 1) * (largura3D / numeroArcos) + (largura3D / numeroArcos) / 2,
              (altura3D + alturaBase) / 2,
              0,
            ]}
          >
            <boxGeometry
              args={[
                largura3D / numeroArcos - 0.1,
                altura3D + alturaBase + 0.5,
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
              ? -largura3D / 2 + largura3D / 6
              : celulaSelecionada === 2
                ? 0
                : largura3D / 2 - largura3D / 6,
            (altura3D + alturaBase) / 2,
            0,
          ]}
        >
          <boxGeometry
            args={[
              largura3D / 3 + 0.2,
              altura3D + alturaBase + 0.5,
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
  config3D,
}) => {
  const numeroArcos = Object.keys(dados.arcos || {}).length || 1;
  const profundidadeArmazem = 8;

  // Mapear pêndulos usando exatamente a estrutura da API e configuração do layout_topo
  const penduloPositions = useMemo(() => {
    const positions = [];

    // Usar configuração do layout_topo se disponível
    const layoutTopo = dados.configuracao?.layout_topo;

    if (layoutTopo) {
      // Usar posicionamento exato do layout_topo
      Object.entries(layoutTopo).forEach(([arcoKey, arcoConfig]) => {
        if (arcoKey !== 'celulas' && arcoKey !== 'aeradores' && arcoConfig.celula) {
          const arcoNumero = parseInt(arcoKey);

          // Converter posição X do 2D para 3D
          // Layout 2D: largura 600px, posições de 30 a 570
          // 3D: distribuir proporcionalmente
          const posX2D = arcoConfig.pos_x;
          const largura2D = 600;
          const larguraArmazem3D = numeroArcos * 3.5;

          // Converter posição proporcional
          const posX3D = -larguraArmazem3D / 2 + (posX2D / largura2D) * larguraArmazem3D;

          // Posição Z baseada no tipo de arco (alternância)
          const posZ = (arcoNumero % 2 === 0) ? -1.5 : 1.5;

          // Processar cada pêndulo do arco
          if (arcoConfig.sensores) {
            Object.entries(arcoConfig.sensores).forEach(([penduloId, posY2D]) => {
              const numeroPendulo = parseInt(penduloId);

              // Buscar dados do pêndulo nos arcos detalhados
              let sensoresDoPendulo = {};

              // Procurar nos arcos detalhados
              if (dados.arcos && dados.arcos[arcoNumero]) {
                Object.entries(dados.arcos[arcoNumero]).forEach(([penduloKey, sensores]) => {
                  if (parseInt(penduloKey) === numeroPendulo) {
                    sensoresDoPendulo = sensores;
                  }
                });
              }

              // Se não encontrou nos arcos detalhados, usar dados dos pêndulos básicos
              if (Object.keys(sensoresDoPendulo).length === 0 && dados.pendulos && dados.pendulos[penduloId]) {
                const [alarme, preAlarme, ativo, tempMaxima] = dados.pendulos[penduloId];
                // Criar sensores fictícios baseados no pêndulo
                for (let s = 1; s <= 5; s++) {
                  sensoresDoPendulo[s] = [
                    tempMaxima + (Math.random() - 0.5) * 2,
                    false,
                    preAlarme,
                    alarme,
                    ativo
                  ];
                }
              }

              positions.push({
                position: [posX3D, 0, posZ],
                numero: numeroPendulo,
                arco: arcoNumero,
                celula: arcoConfig.celula,
                sensores: sensoresDoPendulo,
              });
            });
          }
        }
      });
    } else {
      // Fallback para estrutura simples dos arcos
      Object.entries(dados.arcos || {}).forEach(([arcoKey, arcoData]) => {
        const arcoNumero = parseInt(arcoKey);
        const larguraArmazem = numeroArcos * 3.5;

        let celulaDoArco = 1;
        if (arcoNumero <= Math.ceil(numeroArcos / 3)) celulaDoArco = 1;
        else if (arcoNumero <= Math.ceil(numeroArcos * 2 / 3)) celulaDoArco = 2;
        else celulaDoArco = 3;

        const xArco = -larguraArmazem / 2 + (arcoNumero - 1) * 3.5 + 1.75;
        const zArco = (arcoNumero % 2 === 0) ? -1.5 : 1.5;

        Object.entries(arcoData).forEach(([penduloKey, sensores]) => {
          const numeroPendulo = parseInt(penduloKey);

          positions.push({
            position: [xArco, 0, zArco],
            numero: numeroPendulo,
            arco: arcoNumero,
            celula: celulaDoArco,
            sensores: sensores,
          });
        });
      });
    }

    return positions;
  }, [dados, numeroArcos]);

  // Motores baseados nos aeradores do layout_topo
  const motoresPositions = useMemo(() => {
    const positions = [];
    const layoutTopo = dados.configuracao?.layout_topo;

    if (layoutTopo && layoutTopo.aeradores) {
      Object.entries(layoutTopo.aeradores).forEach(([aeradorId, dados]) => {
        const [posX2D, posY2D, tipo] = dados;

        // Converter posição 2D para 3D
        const largura2D = 600;
        const altura2D = 388;
        const larguraArmazem3D = numeroArcos * 3.5;

        const posX3D = -larguraArmazem3D / 2 + (posX2D / largura2D) * larguraArmazem3D;
        const posZ3D = (posY2D < altura2D / 2) ? profundidadeArmazem / 2 + 1.5 : -profundidadeArmazem / 2 - 1.5;

        positions.push({
          position: [posX3D, 0.2, posZ3D],
          id: parseInt(aeradorId),
          status: Math.random() > 0.7 ? 3 : Math.random() > 0.3 ? 0 : 4,
        });
      });
    }

    return positions;
  }, [dados, numeroArcos, profundidadeArmazem]);

  return (
    <group>
      {/* Estrutura do armazém */}
      <ArmazemStructure3D
        numeroArcos={numeroArcos}
        arcoSelecionado={arcoSelecionado}
        celulaSelecionada={celulaSelecionada}
        tipoSelecao={tipoSelecao}
        alturaArmazem={alturaArmazem}
        config3D={config3D}
      />

      {/* Renderizar pêndulos */}
      {penduloPositions.map((penduloInfo, index) => (
        <Pendulo3D
          key={`${penduloInfo.arco}-${penduloInfo.numero}`}
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
        {penduloPositions.map((penduloInfo, penduloIndex) => {
          const sensoresData = penduloInfo.sensores || {};
          const sensoresArray = Object.entries(sensoresData).map(([key, valores]) => ({
            numero: parseInt(key),
            temperatura: valores[0],
            ponto_quente: valores[1],
            pre_alarme: valores[2],
            falha: valores[3],
            ativo: valores[4]
          }));

          sensoresArray.sort((a, b) => a.numero - b.numero);
          const espacamentoSensores = (alturaArmazem * 0.7) / (sensoresArray.length + 1);

          return sensoresArray.map((sensor, sensorIndex) => {
            const yPos = alturaArmazem * 0.85 - (sensorIndex + 1) * espacamentoSensores;
            const position = [
              penduloInfo.position[0] + 0.4,
              yPos,
              penduloInfo.position[2],
            ];

            return (
              <Billboard
                key={`temp-${penduloInfo.arco}-${penduloInfo.numero}-${sensor.numero}`}
                position={position}
              >
                <Text
                  fontSize={0.12}
                  color={
                    sensor.falha
                      ? "#ff0000"
                      : sensor.ponto_quente
                        ? "#ffaa00"
                        : sensor.ativo
                          ? "#00ff00"
                          : "#cccccc"
                  }
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
                  {sensor.falha
                    ? "ERR"
                    : !sensor.ativo
                      ? "OFF"
                      : sensor.ponto_quente
                        ? "HOT"
                        : `${sensor.temperatura.toFixed(1)}°C`}
                </Text>
              </Billboard>
            );
          });
        })}
      </group>

      {/* Motores */}
      {motoresPositions.map((motorInfo, index) => (
        <Motor3D
          key={`motor-${motorInfo.id}`}
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
            -numeroArcos * 1.5 + i * 3.5 * 3,
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
  const [config3D, setConfig3D] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [tipoSelecao, setTipoSelecao] = useState("arco");
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [zoomedIn, setZoomedIn] = useState(false);

  const alturaArmazem = 8;
  const numeroArcos = dados ? Object.keys(dados.arcos || {}).length : 19;
  const numCelulas = 3;
  const larguraTotal = numeroArcos * 3.5;
  const canvasRef = useRef();

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
        const response = await fetch(
          "/attached_assets/modeloRotaArmazemPortal_1751897945212.json",
        );
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
          style={{ marginLeft: "10px", padding: "5px 10px", fontSize: "12px" }}
        >
          Sincronizar com ModeladorSVG
        </button>
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
        <div><strong>Armazém 3D - Baseado em dados reais</strong></div>
        <hr style={{ margin: "5px 0" }} />
        <div>Arcos: {numeroArcos}</div>
        <div>Pêndulos: {dados.configuracao?.layout_topo ? Object.keys(dados.configuracao.layout_topo).filter(k => k !== 'celulas' && k !== 'aeradores').length : 'N/A'}</div>
        <div>Células: 3</div>
        <div>Aeradores: {dados.configuracao?.layout_topo?.aeradores ? Object.keys(dados.configuracao.layout_topo.aeradores).length : 'N/A'}</div>
        {config3D && (
          <div style={{ marginTop: "10px", fontSize: "12px" }}>
            <strong>Config 2D:</strong>
            <div>Telhado: {config3D.tipo_telhado === 1 ? "Pontudo" : config3D.tipo_telhado === 2 ? "Arredondado" : "Arco"}</div>
            <div>Fundo: {config3D.tipo_fundo === 0 ? "Reto" : config3D.tipo_fundo === 1 ? "Funil/V" : "Duplo V"}</div>
            <div>Largura: {config3D.lb}px</div>
            <div>Altura: {config3D.ht}px</div>
          </div>
        )}
        {tipoSelecao === "arco" && (
          <div style={{ color: "#FF6B35", marginTop: "10px" }}>
            <strong>Arco {arcoSelecionado} selecionado</strong>
          </div>
        )}
        {tipoSelecao === "celula" && (
          <div style={{ color: "#35FF6B", marginTop: "10px" }}>
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
          config3D={config3D}
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