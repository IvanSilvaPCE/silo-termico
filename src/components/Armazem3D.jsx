import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

const Pendulo3D = ({ position, numero, sensores, arcoNumero, alturaArmazem, celulaNumero }) => {
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
          <planeGeometry args={[0.6, 0.25]} />
          <meshStandardMaterial color="#3A78FD" />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          C{numero}
        </Text>
      </Billboard>

      {/* Sensores ao longo do cabo com instancing */}
      <Instances>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial />
        {Object.entries(sensores).map(([sensorKey, valores], index) => {
          const s = parseInt(sensorKey);
          const [temp, , , falha, nivel] = valores;
          const yPos = alturaArmazem * 0.8 - (s * espacamentoSensores);
          const cor = nivel ? corFaixaExata(temp) : "#cccccc";

          return (
            <Instance 
              key={s} 
              position={[0, yPos, 0]}
              color={cor}
            />
          );
        })}
      </Instances>

      {/* Apenas textos dos sensores importantes */}
      {Object.entries(sensores).slice(0, 3).map(([sensorKey, valores], index) => {
        const s = parseInt(sensorKey);
        const [temp, , , falha] = valores;
        const yPos = alturaArmazem * 0.8 - (s * espacamentoSensores);

        return (
          <Billboard key={`text-${s}`} position={[0.2, yPos, 0]}>
            <Text
              fontSize={0.04}
              color={falha ? "#ff0000" : "#ffffff"}
              anchorX="center"
              anchorY="middle"
            >
              {falha ? "ERR" : temp.toFixed(0) + "°"}
            </Text>
          </Billboard>
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
    4: "#ff0000"  // erro
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
        <meshStandardMaterial 
          color="#666666" 
          metalness={0.7} 
          roughness={0.3}
        />
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
          <meshStandardMaterial color="#2c2c2c" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Pás da hélice com instancing */}
        <Instances>
          <boxGeometry args={[0.25, 0.025, 0.06]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.6} roughness={0.3} />
          {[0, 120, 240].map((angle, index) => (
            <Instance
              key={index}
              position={[
                Math.cos((angle * Math.PI) / 180) * 0.15,
                0,
                Math.sin((angle * Math.PI) / 180) * 0.15
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

const ArmazemStructure3D = ({ numeroArcos, arcoSelecionado, alturaArmazem }) => {
  const larguraArco = 3.5; // Compactado de 6 para 3.5
  const larguraArmazem = numeroArcos * larguraArco;
  const profundidadeArmazem = 6; // Reduzido de 8 para 6
  const alturaTelhado = alturaArmazem * 0.35;

  return (
    <group>
      {/* Base/Piso do armazém */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[larguraArmazem + 1, 0.6, profundidadeArmazem + 1]} />
        <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Estrutura principal do armazém */}
      <group>
        {/* Paredes laterais - mais baixas e compactas */}
        <mesh position={[-larguraArmazem/2 - 0.15, alturaArmazem/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, alturaArmazem, profundidadeArmazem]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.8}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[larguraArmazem/2 + 0.15, alturaArmazem/2, 0]} castShadow receiveShadow>
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
        <mesh position={[0, alturaArmazem/2, -profundidadeArmazem/2 - 0.15]} castShadow receiveShadow>
          <boxGeometry args={[larguraArmazem, alturaArmazem, 0.3]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.7}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, alturaArmazem/2, profundidadeArmazem/2 + 0.15]} castShadow receiveShadow>
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
          <mesh position={[0, alturaTelhado/2, -profundidadeArmazem/4]} rotation={[-Math.PI/6, 0, 0]} castShadow>
            <boxGeometry args={[larguraArmazem + 0.5, 0.15, profundidadeArmazem/2 + 0.3]} />
            <meshStandardMaterial 
              color="#666666" 
              metalness={0.4} 
              roughness={0.6}
            />
          </mesh>

          <mesh position={[0, alturaTelhado/2, profundidadeArmazem/4]} rotation={[Math.PI/6, 0, 0]} castShadow>
            <boxGeometry args={[larguraArmazem + 0.5, 0.15, profundidadeArmazem/2 + 0.3]} />
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
          <meshStandardMaterial color="#999999" metalness={0.6} roughness={0.4} />
          {Array.from({length: numeroArcos + 1}, (_, i) => {
            const x = -larguraArmazem/2 + i * larguraArco;
            const isSelected = i === arcoSelecionado;
            
            return (
              <Instance 
                key={i} 
                position={[x, alturaArmazem/2, 0]}
                color={isSelected ? "#FF6B35" : "#999999"}
              />
            );
          })}
        </Instances>

        {/* Labels apenas para arcos selecionados */}
        {arcoSelecionado && (
          <Billboard position={[
            -larguraArmazem/2 + (arcoSelecionado - 1) * larguraArco + larguraArco/2,
            alturaArmazem + alturaTelhado + 0.8,
            0
          ]}>
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
      {arcoSelecionado && arcoSelecionado <= numeroArcos && (
        <mesh position={[
          -larguraArmazem/2 + (arcoSelecionado - 1) * larguraArco + larguraArco/2,
          alturaArmazem/2,
          0
        ]}>
          <boxGeometry args={[larguraArco - 0.1, alturaArmazem + 0.5, profundidadeArmazem + 0.5]} />
          <meshStandardMaterial 
            color="#FF6B35" 
            transparent 
            opacity={0.12}
            wireframe={false}
          />
        </mesh>
      )}
    </group>
  );
};

// Função para gerar dados de exemplo com 19 arcos e 3 células por arco (57 células total)
const gerarDadosArmazem = () => {
  const dados = { leitura: {} };

  for (let arco = 1; arco <= 19; arco++) {
    for (let celula = 1; celula <= 3; celula++) {
      const numeroCelula = ((arco - 1) * 3) + celula;
      dados.leitura[numeroCelula.toString()] = {};

      // Cada célula tem entre 6-10 sensores
      const numSensores = 6 + Math.floor(Math.random() * 5);

      for (let sensor = 1; sensor <= numSensores; sensor++) {
        const temp = 15 + Math.random() * 20; // Temperatura entre 15-35°C
        dados.leitura[numeroCelula.toString()][sensor.toString()] = [
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
  const celulasPorArco = 3;
  const larguraArco = 3.5;
  const profundidadeArmazem = 6;

  const celulaPositions = useMemo(() => {
    const positions = [];
    const larguraArmazem = numeroArcos * larguraArco;

    for (let arco = 1; arco <= numeroArcos; arco++) {
      const xArco = -larguraArmazem/2 + (arco - 1) * larguraArco + larguraArco/2;

      // 3 células por arco
      for (let c = 0; c < celulasPorArco; c++) {
        const numeroCelula = ((arco - 1) * celulasPorArco) + c + 1;
        let zLocal;

        // Posições das 3 células
        if (c === 0) zLocal = -profundidadeArmazem/3; // Célula superior
        else if (c === 1) zLocal = 0; // Célula central
        else zLocal = profundidadeArmazem/3; // Célula inferior

        positions.push({
          position: [xArco, 0, zLocal],
          numero: numeroCelula,
          arco: arco,
          celula: c + 1
        });
      }
    }

    return positions;
  }, []);

  // Posições dos motores baseado na imagem
  const motoresPositions = useMemo(() => {
    const positions = [];
    const larguraArmazem = numeroArcos * larguraArco;

    // Organização dos cabos: 3 esquerda, 3 direita, intercalando
    const motoresConfig = [
      { arco: 1, pos: 'esquerda' }, { arco: 2, pos: 'esquerda' }, { arco: 3, pos: 'esquerda' },
      { arco: 6, pos: 'direita' }, { arco: 7, pos: 'direita' }, { arco: 8, pos: 'direita' },
      { arco: 11, pos: 'esquerda' }, { arco: 12, pos: 'esquerda' }, { arco: 13, pos: 'esquerda' },
      { arco: 16, pos: 'direita' }, { arco: 17, pos: 'direita' }, { arco: 18, pos: 'direita' },
       // Motor extra
      { arco: 4, pos: 'extra' }, { arco: 9, pos: 'extra' }, { arco: 14, pos: 'extra' }, { arco: 5, pos: 'extra' }, { arco: 10, pos: 'extra' }, { arco: 15, pos: 'extra' }, { arco: 19, pos: 'extra' }
    ];

    motoresConfig.forEach((config, index) => {
      const xMotor = -larguraArmazem/2 + (config.arco - 1) * larguraArco + larguraArco/2;
      let zMotor, yMotor;

      if (config.pos === 'esquerda') {
        zMotor = profundidadeArmazem/2 + 0.8;
        yMotor = 0.2;
      } else if (config.pos === 'direita') {
        zMotor = -profundidadeArmazem/2 - 0.8;
        yMotor = 0.2;
      } else { // extra
        zMotor = 0;
        yMotor = 0.2;
      }

      positions.push({
        position: [xMotor, yMotor, zMotor],
        id: index + 1,
        status: Math.random() > 0.7 ? 3 : Math.random() > 0.3 ? 0 : 4 // Maioria ligados
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
        alturaArmazem={alturaArmazem}
      />

      {/* Renderizar células */}
      {celulaPositions.map((celulaInfo) => {
        const sensoresData = dados.leitura[celulaInfo.numero.toString()] || {};

        return (
          <Pendulo3D
            key={celulaInfo.numero}
            position={celulaInfo.position}
            numero={celulaInfo.numero}
            sensores={sensoresData}
            arcoNumero={celulaInfo.arco}
            alturaArmazem={alturaArmazem}
            celulaNumero={celulaInfo.celula}
          />
        );
      })}

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
      {Array.from({length: Math.ceil(numeroArcos/3)}, (_, i) => (
        <pointLight 
          key={i}
          position={[-numeroArcos * 1.5 + i * larguraArco * 3, alturaArmazem * 0.7, 0]}
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
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [tipoSelecao, setTipoSelecao] = useState('arco'); // 'arco' ou 'celula'

  const alturaArmazem = 8; // Reduzido de 10 para 8
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

  const larguraTotal = numeroArcos * 3.5;

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
        
        {/* Seletor de tipo de seleção */}
        <label style={{ marginRight: '20px' }}>
          Tipo de Seleção:
          <select
            value={tipoSelecao}
            onChange={(e) => setTipoSelecao(e.target.value)}
            style={{ marginLeft: '5px' }}
          >
            <option value="arco">Arco</option>
            <option value="celula">Célula</option>
          </select>
        </label>

        {tipoSelecao === 'arco' && (
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
        )}
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
        <div>57 Células (3 por arco)</div>
        <div>~14 Motores aeradores</div>
        <div>~400 Sensores total</div>
      </div>

      {/* Canvas 3D */}
      <Canvas 
        camera={{ 
          position: [larguraTotal * 0.8, alturaArmazem * 1.2, larguraTotal * 0.3], 
          fov: 55 
        }}
        style={{ height: '100%', background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
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
          position={[-larguraTotal * 0.4, alturaArmazem * 1.8, -larguraTotal * 0.2]} 
          intensity={0.7} 
          color="#fff8dc"
        />

        {/* Estrutura completa do armazém */}
        <ArmazemCompleto3D 
          dados={dados}
          arcoSelecionado={tipoSelecao === 'arco' ? arcoSelecionado : null}
          alturaArmazem={alturaArmazem}
        />

        {/* Controles de câmera */}
        <OrbitControls 
          autoRotate={autoRotate}
          autoRotateSpeed={0.15}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={larguraTotal * 0.25}
          maxDistance={larguraTotal * 1.2}
        />

        {/* Grade simplificada do chão */}
        <group position={[0, -1, 0]}>
          <Instances>
            <boxGeometry args={[larguraTotal * 1.1, 0.015, 0.015]} />
            <meshStandardMaterial color="#666666" />
            {Array.from({ length: Math.ceil(larguraTotal / 8) + 1 }, (_, i) => (
              <Instance key={`h-${i}`} position={[0, 0, (i - Math.ceil(larguraTotal / 16)) * 8]} />
            ))}
          </Instances>
          <Instances>
            <boxGeometry args={[0.015, 0.015, larguraTotal * 0.8]} />
            <meshStandardMaterial color="#666666" />
            {Array.from({ length: Math.ceil(larguraTotal / 8) + 1 }, (_, i) => (
              <Instance key={`v-${i}`} position={[(i - Math.ceil(larguraTotal / 16)) * 8, 0, 0]} />
            ))}
          </Instances>
        </group>
      </Canvas>
    </div>
  );
};

export default Armazem3D;