import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import styles from './AdvancedInsights.module.css';

interface HealthMetric {
  label: string;
  value: number;
  color: string;
  description: string;
}

const HealthIndicator: React.FC<{ metric: HealthMetric }> = ({ metric }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshPhongMaterial
            color={metric.color}
            emissive={metric.color}
            emissiveIntensity={hovered ? 0.5 : 0.2}
            transparent
            opacity={0.8}
          />
        </mesh>
        {hovered && (
          <Html center>
            <div className={styles.tooltip}>
              <h4>{metric.label}</h4>
              <p>{metric.description}</p>
              <strong>{(metric.value * 100).toFixed(0)}%</strong>
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
};

const InteractiveHelix: React.FC<{ dnaHealth: number }> = ({ dnaHealth }) => {
  const [rotation, setRotation] = useState(0);
  const speed = useRef(0.02);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (groupRef.current) {
        groupRef.current.rotation.y = rotation;
        setRotation(prev => prev + speed.current);
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [rotation]);

  const points = Array.from({ length: 20 }, (_, i) => {
    const t = i / 20;
    return {
      strand1: [
        Math.cos(t * Math.PI * 4) * 2,
        t * 8 - 4,
        Math.sin(t * Math.PI * 4) * 2
      ],
      strand2: [
        Math.cos(t * Math.PI * 4 + Math.PI) * 2,
        t * 8 - 4,
        Math.sin(t * Math.PI * 4 + Math.PI) * 2
      ]
    };
  });

  const healthColor = new THREE.Color().setHSL(dnaHealth * 0.3, 1, 0.5);

  return (
    <group ref={groupRef}>
      {points.map((point, i) => (
        <group key={i}>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh position={new THREE.Vector3(...point.strand1)}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshPhongMaterial
                color={healthColor}
                emissive={healthColor}
                emissiveIntensity={0.5}
              />
            </mesh>
          </Float>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh position={new THREE.Vector3(...point.strand2)}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshPhongMaterial
                color={healthColor}
                emissive={healthColor}
                emissiveIntensity={0.5}
              />
            </mesh>
          </Float>
          {i < points.length - 1 && (
            <>
              <mesh>
                <cylinderGeometry
                  args={[0.05, 0.05, 1]}
                  position={new THREE.Vector3().lerpVectors(
                    new THREE.Vector3(...point.strand1),
                    new THREE.Vector3(...points[i + 1].strand1),
                    0.5
                  )}
                />
                <meshPhongMaterial color={healthColor} />
              </mesh>
              <mesh>
                <cylinderGeometry
                  args={[0.05, 0.05, 1]}
                  position={new THREE.Vector3().lerpVectors(
                    new THREE.Vector3(...point.strand2),
                    new THREE.Vector3(...points[i + 1].strand2),
                    0.5
                  )}
                />
                <meshPhongMaterial color={healthColor} />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
};

const BrainVisualization: React.FC<{
  cognitiveScore: number;
  insights: string[];
}> = ({ cognitiveScore, insights }) => {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const brainRegions = [
    { position: [1, 0, 0], name: 'Memory', color: '#4a9eff' },
    { position: [-1, 0, 0], name: 'Focus', color: '#ff4a4a' },
    { position: [0, 1, 0], name: 'Learning', color: '#4aff4a' },
    { position: [0, -1, 0], name: 'Processing', color: '#ffff4a' },
  ];

  return (
    <group>
      {brainRegions.map((region, i) => (
        <Float key={i} speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh
            position={new THREE.Vector3(...region.position)}
            onPointerOver={() => setSelectedRegion(i)}
            onPointerOut={() => setSelectedRegion(null)}
          >
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshPhongMaterial
              color={region.color}
              emissive={region.color}
              emissiveIntensity={selectedRegion === i ? 0.8 : 0.2}
            />
          </mesh>
          {selectedRegion === i && (
            <Html center position={new THREE.Vector3(...region.position).multiplyScalar(1.5)}>
              <div className={styles.brainTooltip}>
                <h4>{region.name}</h4>
                <p>{insights[i]}</p>
              </div>
            </Html>
          )}
        </Float>
      ))}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
    </group>
  );
};

interface AdvancedInsightsProps {
  healthData: {
    chronological_age: number;
    biological_age: number;
    cognitive_age: number;
    health_score: number;
    longevity_analysis: {
      genetic_risk: number;
      lifestyle_quality: number;
      environmental_impact: number;
      stress_resilience: number;
    };
    cognitive_insights: string[];
    health_recommendations: string[];
  };
}

const AdvancedInsights: React.FC<AdvancedInsightsProps> = ({ healthData }) => {
  const [activeTab, setActiveTab] = useState('dna');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const healthMetrics: HealthMetric[] = [
    {
      label: 'Genetic Health',
      value: 1 - healthData.longevity_analysis.genetic_risk,
      color: '#4a9eff',
      description: 'Your genetic health potential based on lifestyle and environmental factors.'
    },
    {
      label: 'Lifestyle Quality',
      value: healthData.longevity_analysis.lifestyle_quality,
      color: '#4aff4a',
      description: 'Assessment of your daily habits and their impact on longevity.'
    },
    {
      label: 'Environmental Impact',
      value: healthData.longevity_analysis.environmental_impact,
      color: '#ffff4a',
      description: 'How your environment affects your health and aging process.'
    },
    {
      label: 'Stress Resilience',
      value: healthData.longevity_analysis.stress_resilience,
      color: '#ff4a4a',
      description: 'Your body\'s ability to cope with and recover from stress.'
    }
  ];

  const mockInsights = [
    'Memory performance is optimal for your age group',
    'Focus and attention show room for improvement',
    'Learning capacity is above average',
    'Processing speed matches cognitive age indicators'
  ];

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'dna' ? styles.active : ''}`}
          onClick={() => setActiveTab('dna')}
        >
          DNA Analysis
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'brain' ? styles.active : ''}`}
          onClick={() => setActiveTab('brain')}
        >
          Brain Activity
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'metrics' ? styles.active : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Health Metrics
        </button>
      </div>

      <div className={styles.visualizationContainer}>
        <Canvas camera={{ position: [0, 0, 10] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls enableZoom={false} />
          
          {activeTab === 'dna' && (
            <InteractiveHelix dnaHealth={1 - healthData.longevity_analysis.genetic_risk} />
          )}
          
          {activeTab === 'brain' && (
            <BrainVisualization
              cognitiveScore={(healthData.chronological_age - healthData.cognitive_age) / healthData.chronological_age}
              insights={mockInsights}
            />
          )}
          
          {activeTab === 'metrics' && (
            <group>
              {healthMetrics.map((metric, i) => {
                const angle = (i / healthMetrics.length) * Math.PI * 2;
                return (
                  <group
                    key={metric.label}
                    position={[
                      Math.cos(angle) * 3,
                      Math.sin(angle) * 3,
                      0
                    ]}
                  >
                    <HealthIndicator metric={metric} />
                  </group>
                );
              })}
            </group>
          )}
        </Canvas>
      </div>

      <div className={styles.insightsPanel}>
        <h3>AI Health Insights</h3>
        <div className={styles.aiInsights}>
          {[...(healthData.cognitive_insights || []), ...(healthData.health_recommendations || [])].map((insight, index) => (
            <div key={index} className={styles.insightCard}>
              <p>{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedInsights;
