
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

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
      {/* Cabo principal - do teto até próximo ao chão */}
      <mesh position={[0, alturaArmazem / 2, 0]}>
        <cylinderGeometry args={[0.018, 0.018, alturaArmazem * 0.9, 12]} />
        <meshStandardMaterial color="#2c2c2c" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Nome do pêndulo na base, fora do armazém */}
      <Billboard position={[0, -0.8, 0]}>
        <mesh>
          <planeGeometry args={[0.8, 0.3]} />
          <meshStandardMaterial color="#3A78FD" />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.12}
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
        const yPos = alturaArmazem * 0.8 - (s * espacamentoSensores);
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

const ArmazemStructure3D = ({ numeroArcos, arcoSelecionado, alturaArmazem }) => {
  const larguraArmazem = numeroArcos * 6; // Aumentei o espaço por arco
  const profundidadeArmazem = 8;
  const alturaTelhado = alturaArmazem * 0.4;

  return (
    <group>
      {/* Base/Piso do armazém */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[larguraArmazem + 2, 0.6, profundidadeArmazem + 2]} />
        <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Estrutura principal do armazém */}
      <group>
        {/* Paredes laterais */}
        <mesh position={[-larguraArmazem/2 - 0.2, alturaArmazem/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, alturaArmazem, profundidadeArmazem]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.8}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[larguraArmazem/2 + 0.2, alturaArmazem/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, alturaArmazem, profundidadeArmazem]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.8}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Paredes das extremidades */}
        <mesh position={[0, alturaArmazem/2, -profundidadeArmazem/2 - 0.2]} castShadow receiveShadow>
          <boxGeometry args={[larguraArmazem, alturaArmazem, 0.4]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.7}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, alturaArmazem/2, profundidadeArmazem/2 + 0.2]} castShadow receiveShadow>
          <boxGeometry args={[larguraArmazem, alturaArmazem, 0.4]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.7}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Telhado auto-ajustável duas águas */}
        <group position={[0, alturaArmazem, 0]}>
          {/* Telhado lado A */}
          <mesh position={[0, alturaTelhado/2, -profundidadeArmazem/4]} rotation={[-Math.PI/6, 0, 0]} castShadow>
            <boxGeometry args={[larguraArmazem + 1, 0.2, profundidadeArmazem/2 + 0.5]} />
            <meshStandardMaterial 
              color="#666666" 
              metalness={0.4} 
              roughness={0.6}
            />
          </mesh>

          {/* Telhado lado B */}
          <mesh position={[0, alturaTelhado/2, profundidadeArmazem/4]} rotation={[Math.PI/6, 0, 0]} castShadow>
            <boxGeometry args={[larguraArmazem + 1, 0.2, profundidadeArmazem/2 + 0.5]} />
            <meshStandardMaterial 
              color="#666666" 
              metalness={0.4} 
              roughness={0.6}
            />
          </mesh>

          {/* Cumeeira central */}
          <mesh position={[0, alturaTelhado + 0.1, 0]} castShadow>
            <boxGeometry args={[larguraArmazem + 1.2, 0.3, 0.4]} />
            <meshStandardMaterial 
              color="#444444" 
              metalness={0.7} 
              roughness={0.3}
            />
          </mesh>

          {/* Beirais laterais */}
          <mesh position={[0, alturaTelhado/4, -profundidadeArmazem/2 - 0.3]} castShadow>
            <boxGeometry args={[larguraArmazem + 2, 0.15, 0.6]} />
            <meshStandardMaterial 
              color="#555555" 
              metalness={0.5} 
              roughness={0.5}
            />
          </mesh>
          <mesh position={[0, alturaTelhado/4, profundidadeArmazem/2 + 0.3]} castShadow>
            <boxGeometry args={[larguraArmazem + 2, 0.15, 0.6]} />
            <meshStandardMaterial 
              color="#555555" 
              metalness={0.5} 
              roughness={0.5}
            />
          </mesh>
        </group>

        {/* Estruturas de divisão entre arcos (vigas) */}
        {Array.from({length: numeroArcos + 1}, (_, i) => {
          const x = -larguraArmazem/2 + i * 6;
          const isSelected = i === arcoSelecionado;
          
          return (
            <group key={i}>
              {/* Viga vertical */}
              <mesh position={[x, alturaArmazem/2, 0]} castShadow>
                <boxGeometry args={[0.2, alturaArmazem + 0.4, 0.2]} />
                <meshStandardMaterial 
                  color={isSelected ? "#FF6B35" : "#999999"} 
                  metalness={0.6}
                  roughness={0.4}
                />
              </mesh>

              {/* Viga horizontal superior */}
              <mesh position={[x, alturaArmazem, 0]}>
                <boxGeometry args={[0.2, 0.2, profundidadeArmazem]} />
                <meshStandardMaterial color="#999999" metalness={0.6} roughness={0.4} />
              </mesh>

              {/* Label do arco */}
              {i > 0 && i <= numeroArcos && (
                <Billboard position={[x - 3, alturaArmazem + alturaTelhado + 1.2, 0]}>
                  <Text
                    fontSize={0.5}
                    color={isSelected ? "#FF6B35" : "#333333"}
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

        
      </group>

      {/* Highlight do arco selecionado */}
      {arcoSelecionado && arcoSelecionado <= numeroArcos && (
        <mesh position={[
          -larguraArmazem/2 + (arcoSelecionado - 1) * 6 + 3,
          alturaArmazem/2,
          0
        ]}>
          <boxGeometry args={[5.8, alturaArmazem + 0.8, profundidadeArmazem + 1]} />
          <meshStandardMaterial 
            color="#FF6B35" 
            transparent 
            opacity={0.15}
            wireframe={false}
          />
        </mesh>
      )}
    </group>
  );
};

// Função para gerar dados de exemplo com 19 arcos e 3 pêndulos por arco (57 total)
const gerarDadosArmazem = () => {
  const dados = { leitura: {} };
  
  for (let arco = 1; arco <= 19; arco++) {
    for (let pendulo = 1; pendulo <= 3; pendulo++) {
      const numeroPendulo = ((arco - 1) * 3) + pendulo;
      dados.leitura[numeroPendulo.toString()] = {};
      
      // Cada pêndulo tem entre 8-12 sensores
      const numSensores = 8 + Math.floor(Math.random() * 5);
      
      for (let sensor = 1; sensor <= numSensores; sensor++) {
        const temp = 15 + Math.random() * 20; // Temperatura entre 15-35°C
        dados.leitura[numeroPendulo.toString()][sensor.toString()] = [
          temp, // temperatura
          false, // alarme
          'OK', // qualidade
          false, // falha
          true // ativo
        ];
      }
    }
  }
  
  return dados;
};

const ArmazemCompleto3D = ({ dados, arcoSelecionado, alturaArmazem }) => {
  const numeroArcos = 19;
  const pendulosPorArco = 3;
  
  const pendulosPositions = useMemo(() => {
    const positions = [];
    const larguraArmazem = numeroArcos * 6;
    
    for (let arco = 1; arco <= numeroArcos; arco++) {
      const xArco = -larguraArmazem/2 + (arco - 1) * 6 + 3;
      
      // 3 pêndulos por arco
      for (let p = 0; p < pendulosPorArco; p++) {
        const xLocal = -2 + p * 2; // Distribui os 3 pêndulos no arco
        const zLocal = (p === 1) ? 0 : (p === 0 ? -2 : 2); // Posição Z variada
        positions.push({
          position: [xArco + xLocal, 0, zLocal],
          numero: ((arco - 1) * pendulosPorArco) + p + 1,
          arco: arco
        });
      }
    }
    
    return positions;
  }, []);

  return (
    <group>
      {/* Estrutura do armazém */}
      <ArmazemStructure3D 
        numeroArcos={numeroArcos}
        arcoSelecionado={arcoSelecionado}
        alturaArmazem={alturaArmazem}
      />

      {/* Renderizar pêndulos */}
      {pendulosPositions.map((penduloInfo, index) => {
        const sensoresData = dados.leitura[penduloInfo.numero.toString()] || {};

        return (
          <Pendulo3D
            key={penduloInfo.numero}
            position={penduloInfo.position}
            numero={penduloInfo.numero}
            sensores={sensoresData}
            arcoNumero={penduloInfo.arco}
            alturaArmazem={alturaArmazem}
          />
        );
      })}

      {/* Sistema de iluminação interno */}
      {Array.from({length: numeroArcos}, (_, i) => (
        <pointLight 
          key={i}
          position={[-numeroArcos * 3 + i * 6 + 3, alturaArmazem * 0.8, 0]}
          intensity={0.4}
          distance={10}
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
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const alturaArmazem = 10;
  const numeroArcos = 19;

  useEffect(() => {
    const inicializarDados = async () => {
      try {
        setCarregando(true);
        const dadosGerados = gerarDadosArmazem();
        setDados(dadosGerados);
      } catch (error) {
        console.error('Erro ao inicializar dados 3D:', error);
      } finally {
        setCarregando(false);
      }
    };

    inicializarDados();
  }, []);

  if (carregando || !dados) {
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

  const larguraTotal = numeroArcos * 6;

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
            {Array.from({length: numeroArcos}, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Informações dos dados */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        zIndex: 1000,
        background: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <div>19 Arcos</div>
        <div>57 Pêndulos (3 por arco)</div>
        <div>~570 Sensores total</div>
      </div>

      {/* Canvas 3D */}
      <Canvas 
        camera={{ 
          position: [larguraTotal * 0.7, alturaArmazem * 1.5, larguraTotal * 0.4], 
          fov: 60 
        }}
        style={{ height: '100%', background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
        shadows
      >
        {/* Iluminação */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[larguraTotal, alturaArmazem * 3, larguraTotal * 0.5]} 
          intensity={1.5} 
          castShadow
        />
        <directionalLight 
          position={[-larguraTotal * 0.5, alturaArmazem * 2, -larguraTotal * 0.3]} 
          intensity={0.8} 
          color="#fff8dc"
        />

        {/* Estrutura completa do armazém */}
        <ArmazemCompleto3D 
          dados={dados}
          arcoSelecionado={arcoSelecionado}
          alturaArmazem={alturaArmazem}
        />

        {/* Controles de câmera */}
        <OrbitControls 
          autoRotate={autoRotate}
          autoRotateSpeed={0.2}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={larguraTotal * 0.3}
          maxDistance={larguraTotal * 1.5}
        />

        {/* Grade do chão - igual ao silo */}
        <group position={[0, -1, 0]}>
          {/* Linhas horizontais */}
          {Array.from({ length: Math.ceil(larguraTotal / 6) + 1 }, (_, i) => (
            <mesh key={`h-${i}`} position={[0, 0, (i - Math.ceil(larguraTotal / 12)) * 6]} rotation={[0, 0, 0]}>
              <boxGeometry args={[larguraTotal * 1.2, 0.02, 0.02]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          ))}
          {/* Linhas verticais */}
          {Array.from({ length: Math.ceil(larguraTotal / 6) + 1 }, (_, i) => (
            <mesh key={`v-${i}`} position={[(i - Math.ceil(larguraTotal / 12)) * 6, 0, 0]} rotation={[0, 0, 0]}>
              <boxGeometry args={[0.02, 0.02, larguraTotal]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          ))}
        </group>
      </Canvas>
    </div>
  );
};

export default Armazem3D;
