import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

// Função de cor memoizada
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
const SILO_GEOMETRIES = {
  cabo: new THREE.CylinderGeometry(0.02, 0.02, 1, 8),
  sensor: new THREE.BoxGeometry(0.25, 0.12, 0.12),
  antena: new THREE.CylinderGeometry(0.01, 0.01, 0.08, 6),
  peso: new THREE.CylinderGeometry(0.08, 0.06, 0.2, 12),
  placa: new THREE.PlaneGeometry(0.6, 0.25),
};

// Materiais compartilhados
const SILO_MATERIALS = {
  cabo: new THREE.MeshStandardMaterial({ color: "#1a1a1a", metalness: 0.8, roughness: 0.2 }),
  antena: new THREE.MeshStandardMaterial({ color: "#666666" }),
  peso: new THREE.MeshStandardMaterial({ color: "#444444", metalness: 0.8, roughness: 0.3 }),
  placa: new THREE.MeshStandardMaterial({ color: "#2E86AB" }),
};

const Cabo3D = React.memo(({ position, pendulo, sensores, alturaSilo, raioSilo }) => {
  const grupoRef = useRef();

  const sensoresProcessados = useMemo(() => {
    return Object.entries(sensores).map(([key, valores]) => ({
      numero: parseInt(key),
      temp: parseFloat(valores[0]),
      alarme: valores[1],
      qualidade: valores[2],
      falha: valores[3],
      ativo: valores[4],
      cor: valores[4] ? corFaixaExata(parseFloat(valores[0])) : "#cccccc"
    }));
  }, [sensores]);

  const { topoSilo, baseSilo, alturaCabo, espacamentoSensores } = useMemo(() => {
    const topo = alturaSilo;
    const base = 0.3;
    const altura = topo - base;
    const espacamento = altura / (sensoresProcessados.length + 1);
    return { topoSilo: topo, baseSilo: base, alturaCabo: altura, espacamentoSensores: espacamento };
  }, [alturaSilo, sensoresProcessados.length]);

  return (
    <group ref={grupoRef} position={position}>
      <mesh position={[0, (topoSilo + baseSilo) / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, alturaCabo, 8]} />
        <primitive object={SILO_MATERIALS.cabo} />
      </mesh>

      <Billboard position={[0, baseSilo - 0.8, 0]}>
        <mesh>
          <primitive object={SILO_GEOMETRIES.placa} />
          <primitive object={SILO_MATERIALS.placa} />
        </mesh>
        <Text position={[0, 0, 0.01]} fontSize={0.1} color="white" anchorX="center" anchorY="middle">
          P{pendulo}
        </Text>
      </Billboard>

      {sensoresProcessados.map((sensor, index) => {
        const yPos = topoSilo - ((index + 1) * espacamentoSensores);
        return (
          <group key={sensor.numero} position={[0, yPos, 0]}>
            <mesh>
              <primitive object={SILO_GEOMETRIES.sensor} />
              <meshStandardMaterial 
                color={sensor.cor}
                emissive={sensor.alarme ? "#ff0000" : "#000000"}
                emissiveIntensity={sensor.alarme ? 0.3 : 0}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>
            <mesh position={[0, 0.08, 0]}>
              <primitive object={SILO_GEOMETRIES.antena} />
              <primitive object={SILO_MATERIALS.antena} />
            </mesh>
          </group>
        );
      })}

      <mesh position={[0, baseSilo + 0.1, 0]}>
        <primitive object={SILO_GEOMETRIES.peso} />
        <primitive object={SILO_MATERIALS.peso} />
      </mesh>
    </group>
  );
});

const Aerador3D = React.memo(({ position, id, status, raioSilo }) => {
  const grupoRef = useRef();
  const heliceRef = useRef();

  const cores = useMemo(() => ({
    0: "#c5c5c5",
    1: "#ffeb3b", 
    3: "#31dd0f",
    4: "#ff0000"
  }), []);

  useFrame((state, delta) => {
    if (heliceRef.current && status === 3) {
      heliceRef.current.rotation.y += delta * 15;
    }
  });

  return (
    <group ref={grupoRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 0.2, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.3, 12]} />
        <meshStandardMaterial color={cores[status] || cores[0]} metalness={0.6} roughness={0.4} />
      </mesh>

      <Instances>
        <boxGeometry args={[0.03, 0.25, 0.08]} />
        <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
        {[0, 90, 180, 270].map((angle, index) => (
          <Instance
            key={index}
            position={[Math.cos((angle * Math.PI) / 180) * 0.32, 0.15, Math.sin((angle * Math.PI) / 180) * 0.32]}
            rotation={[0, (angle * Math.PI) / 180, 0]}
          />
        ))}
      </Instances>

      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 6]} />
        <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
      </mesh>

      <group ref={heliceRef} position={[0, 0.42, 0]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.08, 0.06, 6]} />
          <meshStandardMaterial color="#2c2c2c" metalness={0.9} roughness={0.1} />
        </mesh>

        <Instances>
          <boxGeometry args={[0.3, 0.03, 0.08]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.6} roughness={0.3} />
          {[0, 72, 144, 216, 288].map((angle, index) => (
            <Instance
              key={index}
              position={[Math.cos((angle * Math.PI) / 180) * 0.2, 0, Math.sin((angle * Math.PI) / 180) * 0.2]}
              rotation={[0, (angle * Math.PI) / 180, Math.PI / 8]}
            />
          ))}
        </Instances>
      </group>

      <Billboard position={[0, 0.05, 0.4]}>
        <mesh>
          <planeGeometry args={[0.3, 0.1]} />
          <meshStandardMaterial color="#2E86AB" />
        </mesh>
        <Text position={[0, 0, 0.001]} fontSize={0.04} color="white" anchorX="center" anchorY="middle">
          AE-{id}
        </Text>
      </Billboard>
    </group>
  );
});

const SiloStructure3D = React.memo(({ numCabos, alturaSilo, raioSilo }) => {
  const alturaTopo = 1.2;

  return (
    <group>
      <mesh position={[0, alturaSilo / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[raioSilo, raioSilo, alturaSilo, 32, 1, true]} />
        <meshStandardMaterial 
          color="#E5E5E5" 
          transparent 
          opacity={0.3} 
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[raioSilo + 0.1, raioSilo + 0.1, 0.3, 32]} />
        <meshStandardMaterial color="#999999" metalness={0.5} roughness={0.5} />
      </mesh>

      <mesh position={[0, alturaSilo + alturaTopo / 2, 0]} castShadow>
        <coneGeometry args={[raioSilo * 1.1, alturaTopo, 24]} />
        <meshStandardMaterial color="#999999" metalness={0.3} roughness={0.6} />
      </mesh>

      <mesh position={[0, alturaSilo + alturaTopo - 0.02, 0]}>
        <cylinderGeometry args={[raioSilo * 0.15, raioSilo * 0.18, 0.08, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
});

const NivelGrao3D = React.memo(({ nivel, raioSilo, alturaSilo }) => {
  const alturaGrao = (nivel / 100) * alturaSilo * 0.8;

  return (
    <mesh position={[0, alturaGrao / 2 + 0.2, 0]}>
      <cylinderGeometry args={[raioSilo * 0.95, raioSilo * 0.95, alturaGrao, 24]} />
      <meshStandardMaterial color="#D4B886" transparent opacity={0.8} roughness={0.9} metalness={0.1} />
    </mesh>
  );
});

const Silo3D = ({ dados }) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const orbitRef = useRef(null);

  if (!dados) return <div>Carregando dados 3D...</div>;

  const layout = dados.dados_layout;
  const leitura = dados.leitura;
  const motorStatus = dados.motor?.statusMotor || [];
  const nivel = dados.dados?.nivel || 66.6;

  const dimensoes = useMemo(() => {
    const numCabos = Object.keys(leitura).length;
    const maxSensores = Math.max(...Object.values(leitura).map(cabo => Object.keys(cabo).length));
    return {
      numCabos,
      alturaSilo: maxSensores * 0.8 + 2,
      raioSilo: Math.max(3, numCabos * 0.8)
    };
  }, [leitura]);

  const { cabosPositions, aeradoresPositions } = useMemo(() => {
    const cabosPos = [];
    const raioDistribuicao = dimensoes.raioSilo * 0.7;

    if (dimensoes.numCabos === 1) {
      cabosPos.push([0, 0, 0]);
    } else {
      Object.keys(leitura).forEach((pend, index) => {
        const angle = (index / dimensoes.numCabos) * Math.PI * 2;
        const x = Math.cos(angle) * raioDistribuicao;
        const z = Math.sin(angle) * raioDistribuicao;
        cabosPos.push([x, 0, z]);
      });
    }

    const aeradoresPos = [];
    if (layout.aeradores && layout.aeradores.na > 0) {
      const numAeradores = layout.aeradores.na;
      const raioAeradores = dimensoes.raioSilo * 1.3;

      for (let i = 0; i < numAeradores; i++) {
        const angle = (i / numAeradores) * Math.PI * 2;
        const x = Math.cos(angle) * raioAeradores;
        const z = Math.sin(angle) * raioAeradores;
        aeradoresPos.push([x, 0.2, z]);
      }
    }

    return { cabosPositions: cabosPos, aeradoresPositions: aeradoresPos };
  }, [layout, leitura, dimensoes]);

  const handleInteraction = useCallback(() => {
    setLastInteractionTime(Date.now());
  }, []);

  const handleAutoRotateChange = useCallback((e) => {
    setAutoRotate(e.target.checked);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        left: '10px', 
        zIndex: 1000,
        background: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <label>
          <input 
            type="checkbox" 
            checked={autoRotate}
            onChange={handleAutoRotateChange}
          />
          Rotação Automática
        </label>
      </div>

      <Canvas 
        camera={{ position: [dimensoes.raioSilo * 3, dimensoes.alturaSilo * 0.8, dimensoes.raioSilo * 3], fov: 60 }}
        style={{ height: '100%', background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[dimensoes.raioSilo * 4, dimensoes.alturaSilo * 2, dimensoes.raioSilo * 2]} 
          intensity={1.0} 
          castShadow
        />
        <pointLight position={[0, dimensoes.alturaSilo, 0]} intensity={0.6} />

        <SiloStructure3D 
          numCabos={dimensoes.numCabos}
          alturaSilo={dimensoes.alturaSilo}
          raioSilo={dimensoes.raioSilo}
        />

        <NivelGrao3D 
          nivel={nivel}
          raioSilo={dimensoes.raioSilo}
          alturaSilo={dimensoes.alturaSilo}
        />

        <group>
          {Object.entries(leitura).map(([pendulo, sensores], index) => (
            <Cabo3D
              key={`cabo-${pendulo}`}
              position={cabosPositions[index]}
              pendulo={pendulo}
              sensores={sensores}
              alturaSilo={dimensoes.alturaSilo}
              raioSilo={dimensoes.raioSilo}
            />
          ))}
        </group>

        {aeradoresPositions.map((position, index) => (
          <Aerador3D
            key={index}
            position={position}
            id={index + 1}
            status={motorStatus[index] || 0}
            raioSilo={dimensoes.raioSilo}
          />
        ))}

        <OrbitControls 
          ref={orbitRef}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={dimensoes.raioSilo * 1.5}
          maxDistance={dimensoes.raioSilo * 12}
          onStart={handleInteraction}
          onChange={handleInteraction}
        />
      </Canvas>
    </div>
  );
};

export default Silo3D;