import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import LayoutManager from "../utils/layoutManager";

const Pendulo3D = ({ position, numero, sensores, arcoNumero, alturaArmazem }) => {
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

  const espacamentoSensores = (alturaArmazem * 0.7) / (Object.keys(sensores).length + 1);

  return (
    <group ref={grupoRef} position={position}>
      {/* Cabo principal */}
      <mesh position={[0, alturaArmazem / 3, 0]}>
        <cylinderGeometry args={[0.018, 0.018, alturaArmazem * 0.7, 12]} />
        <meshStandardMaterial color="#2c2c2c" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Placa de identificação do pêndulo */}
      <Billboard position={[0, alturaArmazem * 0.8, 0]}>
        <mesh>
          <planeGeometry args={[0.6, 0.25]} />
          <meshStandardMaterial color="#3A78FD" />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          P{numero}
        </Text>
      </Billboard>

      {/* Sensores ao longo do cabo */}
      {Object.entries(sensores).map(([sensorKey, valores], index) => {
        const s = parseInt(sensorKey);
        const [temp, , , falha, nivel] = valores;
        const yPos = alturaArmazem * 0.65 - (s * espacamentoSensores);
        const cor = nivel ? corFaixaExata(temp) : "#cccccc";

        return (
          <group key={s} position={[0, yPos, 0]}>
            {/* Corpo do sensor */}
            <mesh>
              <boxGeometry args={[0.2, 0.1, 0.1]} />
              <meshStandardMaterial 
                color={cor}
                emissive={falha ? "#ff0000" : "#000000"}
                emissiveIntensity={falha ? 0.25 : 0}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>

            {/* Antena do sensor */}
            <mesh position={[0, 0.07, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
              <meshStandardMaterial color="#666666" />
            </mesh>

            {/* Display do valor */}
            <Billboard position={[0, 0, 0.07]}>
              <mesh>
                <planeGeometry args={[0.15, 0.05]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
              <Text
                position={[0, 0, 0.001]}
                fontSize={0.03}
                color="#00ff00"
                anchorX="center"
                anchorY="middle"
              >
                {falha ? "ERR" : temp.toFixed(1) + "°"}
              </Text>
            </Billboard>
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

const ArmazemStructure3D = ({ analiseArcos, arcoSelecionado, alturaArmazem }) => {
  const totalArcos = analiseArcos.totalArcos;
  const larguraArmazem = totalArcos * 5;
  const profundidadeArmazem = 6;
  const alturaTelhado = alturaArmazem * 0.4;

  return (
    <group>
      {/* Base/Piso do armazém */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[larguraArmazem + 1, 0.4, profundidadeArmazem + 1]} />
        <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Estrutura principal do armazém */}
      <group>
        {/* Paredes laterais */}
        <mesh position={[-larguraArmazem/2 - 0.1, alturaArmazem/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, alturaArmazem, profundidadeArmazem]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.9}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[larguraArmazem/2 + 0.1, alturaArmazem/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, alturaArmazem, profundidadeArmazem]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.9}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Paredes das extremidades */}
        <mesh position={[0, alturaArmazem/2, -profundidadeArmazem/2 - 0.1]} castShadow receiveShadow>
          <boxGeometry args={[larguraArmazem, alturaArmazem, 0.2]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.8}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, alturaArmazem/2, profundidadeArmazem/2 + 0.1]} castShadow receiveShadow>
          <boxGeometry args={[larguraArmazem, alturaArmazem, 0.2]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.8}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Telhado em formato de casa - duas águas */}
        <group position={[0, alturaArmazem + alturaTelhado/2, 0]}>
          {/* Lado esquerdo do telhado */}
          <mesh position={[0, 0, -profundidadeArmazem/4]} rotation={[0, 0, Math.PI/6]} castShadow>
            <boxGeometry args={[larguraArmazem + 0.5, 0.1, profundidadeArmazem/2 + 0.2]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
          {/* Lado direito do telhado */}
          <mesh position={[0, 0, profundidadeArmazem/4]} rotation={[0, 0, -Math.PI/6]} castShadow>
            <boxGeometry args={[larguraArmazem + 0.5, 0.1, profundidadeArmazem/2 + 0.2]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
        </group>

        {/* Estruturas de divisão entre arcos (vigas) */}
        {Array.from({length: totalArcos + 1}, (_, i) => {
          const x = -larguraArmazem/2 + i * 5;
          return (
            <group key={i}>
              {/* Viga vertical */}
              <mesh position={[x, alturaArmazem/2, 0]} castShadow>
                <boxGeometry args={[0.15, alturaArmazem + 0.2, 0.15]} />
                <meshStandardMaterial 
                  color={i === arcoSelecionado ? "#FF6B35" : "#999999"} 
                  metalness={0.6}
                  roughness={0.4}
                />
              </mesh>

              {/* Viga horizontal superior */}
              <mesh position={[x, alturaArmazem, 0]}>
                <boxGeometry args={[0.15, 0.15, profundidadeArmazem]} />
                <meshStandardMaterial color="#999999" metalness={0.6} roughness={0.4} />
              </mesh>

              {/* Label do arco */}
              {i > 0 && i <= totalArcos && (
                <Billboard position={[x - 2.5, alturaArmazem + alturaTelhado + 0.5, 0]}>
                  <Text
                    fontSize={0.4}
                    color={i === arcoSelecionado ? "#FF6B35" : "#333333"}
                    anchorX="center"
                    anchorY="middle"
                  >
                    ARCO {i}
                  </Text>
                </Billboard>
              )}
            </group>
          );
        })}

        {/* Vigas de apoio do telhado */}
        {Array.from({length: 3}, (_, i) => (
          <mesh key={i} position={[0, alturaArmazem + 0.1, -profundidadeArmazem/2 + i * profundidadeArmazem/2]}>
            <boxGeometry args={[larguraArmazem, 0.1, 0.1]} />
            <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Highlight do arco selecionado */}
      {arcoSelecionado && (
        <mesh position={[
          -larguraArmazem/2 + (arcoSelecionado - 1) * 5 + 2.5,
          alturaArmazem/2,
          0
        ]}>
          <boxGeometry args={[4.8, alturaArmazem + 0.5, profundidadeArmazem + 0.8]} />
          <meshStandardMaterial 
            color="#FF6B35" 
            transparent 
            opacity={0.1}
            wireframe={false}
          />
        </mesh>
      )}
    </group>
  );
};

const ArmazemCompleto3D = ({ dadosPortal, analiseArcos, arcoSelecionado, alturaArmazem }) => {
  const pendulosPositions = useMemo(() => {
    if (!analiseArcos || !dadosPortal) return {};

    const posicoesPorArco = {};
    const larguraArmazem = analiseArcos.totalArcos * 5;

    Object.keys(analiseArcos.arcos).forEach(arcoNum => {
      const arcoInfo = analiseArcos.arcos[arcoNum];
      const arcoIndex = parseInt(arcoNum) - 1;

      if (arcoInfo) {
        const positions = [];
        const xArco = -larguraArmazem/2 + arcoIndex * 5 + 2.5;
        const larguraArco = 4;
        const espacamentoPendulo = arcoInfo.totalPendulos > 1 ? 
          larguraArco / (arcoInfo.totalPendulos + 1) : larguraArco / 2;

        arcoInfo.pendulos.forEach((pendulo, index) => {
          const xLocal = -larguraArco/2 + (index + 1) * espacamentoPendulo;
          const xGlobal = xArco + xLocal;
          const z = (index % 2 === 0 ? -1.2 : 1.2);
          positions.push([xGlobal, 0, z]);
        });

        posicoesPorArco[arcoNum] = positions;
      }
    });

    return posicoesPorArco;
  }, [analiseArcos, dadosPortal]);

  return (
    <group>
      {/* Estrutura do armazém */}
      <ArmazemStructure3D 
        analiseArcos={analiseArcos} 
        arcoSelecionado={arcoSelecionado}
        alturaArmazem={alturaArmazem}
      />

      {/* Renderizar pêndulos para todos os arcos */}
      {Object.entries(pendulosPositions).map(([arcoNum, positions]) => {
        const arcoInfo = analiseArcos.arcos[arcoNum];
        if (!arcoInfo) return null;

        const dadosArco = LayoutManager.converterDadosPortalParaArmazem(dadosPortal, parseInt(arcoNum));

        return positions.map((position, index) => {
          const pendulo = arcoInfo.pendulos[index];
          if (!pendulo) return null;

          const penduloKey = Object.keys(dadosArco.leitura)[index];
          const sensoresData = dadosArco.leitura[penduloKey];

          return (
            <Pendulo3D
              key={`${arcoNum}-${pendulo.numero}`}
              position={position}
              numero={pendulo.numero}
              sensores={sensoresData || {}}
              arcoNumero={parseInt(arcoNum)}
              alturaArmazem={alturaArmazem}
            />
          );
        });
      })}

      {/* Sistema de iluminação interno */}
      {Array.from({length: analiseArcos.totalArcos}, (_, i) => (
        <pointLight 
          key={i}
          position={[-analiseArcos.totalArcos * 2.5 + i * 5 + 2.5, alturaArmazem * 0.9, 0]}
          intensity={0.5}
          distance={8}
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
  const [dadosPortal, setDadosPortal] = useState(null);
  const [analiseArcos, setAnaliseArcos] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const alturaArmazem = 8;

  useEffect(() => {
    const inicializarDados = async () => {
      try {
        setCarregando(true);

        const dadosExemplo = LayoutManager.gerarDadosExemploPortal();
        setDadosPortal(dadosExemplo);

        const analise = LayoutManager.analisarEstruturaArcos(dadosExemplo);
        setAnaliseArcos(analise);

      } catch (error) {
        console.error('Erro ao inicializar dados 3D:', error);
      } finally {
        setCarregando(false);
      }
    };

    inicializarDados();
  }, []);

  if (carregando || !analiseArcos || !dadosPortal) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Carregando Armazém 3D...
      </div>
    );
  }

  const larguraTotal = analiseArcos.totalArcos * 5;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* Controles simples */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 1000,
        background: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <label style={{ marginRight: '20px' }}>
          <input 
            type="checkbox" 
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
          />
          Rotação Automática
        </label>
        <label>
          Arco: 
          <select 
            value={arcoSelecionado}
            onChange={(e) => setArcoSelecionado(parseInt(e.target.value))}
            style={{ marginLeft: '5px' }}
          >
            {Object.keys(analiseArcos.arcos).map(numeroArco => (
              <option key={numeroArco} value={numeroArco}>
                {numeroArco}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Canvas 3D */}
      <Canvas 
        camera={{ 
          position: [larguraTotal * 0.8, alturaArmazem * 1.2, larguraTotal * 0.6], 
          fov: 60 
        }}
        style={{ height: '100%', background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
        shadows
      >
        {/* Iluminação */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[larguraTotal, alturaArmazem * 2, larguraTotal * 0.5]} 
          intensity={1.2} 
          castShadow
        />
        <directionalLight 
          position={[-larguraTotal * 0.5, alturaArmazem * 1.5, -larguraTotal * 0.3]} 
          intensity={0.6} 
          color="#fff8dc"
        />

        {/* Estrutura completa do armazém */}
        <ArmazemCompleto3D 
          dadosPortal={dadosPortal}
          analiseArcos={analiseArcos}
          arcoSelecionado={arcoSelecionado}
          alturaArmazem={alturaArmazem}
        />

        {/* Controles de câmera */}
        <OrbitControls 
          autoRotate={autoRotate}
          autoRotateSpeed={0.3}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={larguraTotal * 0.5}
          maxDistance={larguraTotal * 2}
        />

        {/* Plano do terreno */}
        <mesh position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[larguraTotal * 2, larguraTotal * 1.5]} />
          <meshStandardMaterial color="#8FBC8F" />
          <primitive object={new THREE.Mesh().rotateX(-Math.PI / 2)} />
        </mesh>
      </Canvas>
    </div>
  );
};

export default Armazem3D;