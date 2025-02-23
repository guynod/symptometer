import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, ActivityIndicator, Dimensions, GestureResponderEvent, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { G, Circle, Line, Path, Rect } from 'react-native-svg';
import { getFrequentlyUsedBodyParts } from '../services/frequently-used';

interface BodyPartSelectorProps {
  onSelect: (bodyPart: string) => void;
  selectedPart?: string | null;
}

interface BodyRegion {
  name: string;
  displayName: string;
  coordinates: { x: [number, number]; y: [number, number] };
  subRegions?: BodyRegion[];
}

interface FrequentlyUsedItem {
  name: string;
  count: number;
}

const screenWidth = Dimensions.get('window').width;
const svgWidth = Math.min(screenWidth - 40, 300);
const svgHeight = svgWidth * 2;

// Add hand and foot sub-regions
const handSubRegions = (side: 'left' | 'right'): BodyRegion[] => [
  { name: `${side}-thumb`, displayName: `${side === 'left' ? 'Left' : 'Right'} Thumb`, coordinates: side === 'left' ? { x: [25, 35], y: [185, 195] } : { x: [165, 175], y: [185, 195] } },
  { name: `${side}-index`, displayName: `${side === 'left' ? 'Left' : 'Right'} Index Finger`, coordinates: side === 'left' ? { x: [30, 40], y: [190, 200] } : { x: [160, 170], y: [190, 200] } },
  { name: `${side}-middle`, displayName: `${side === 'left' ? 'Left' : 'Right'} Middle Finger`, coordinates: side === 'left' ? { x: [35, 45], y: [192, 202] } : { x: [155, 165], y: [192, 202] } },
  { name: `${side}-ring`, displayName: `${side === 'left' ? 'Left' : 'Right'} Ring Finger`, coordinates: side === 'left' ? { x: [40, 50], y: [190, 200] } : { x: [150, 160], y: [190, 200] } },
  { name: `${side}-pinky`, displayName: `${side === 'left' ? 'Left' : 'Right'} Pinky`, coordinates: side === 'left' ? { x: [45, 55], y: [188, 198] } : { x: [145, 155], y: [188, 198] } },
  { name: `${side}-palm`, displayName: `${side === 'left' ? 'Left' : 'Right'} Palm`, coordinates: side === 'left' ? { x: [30, 50], y: [175, 190] } : { x: [150, 170], y: [175, 190] } },
];

const footSubRegions = (side: 'left' | 'right'): BodyRegion[] => [
  { name: `${side}-big-toe`, displayName: `${side === 'left' ? 'Left' : 'Right'} Big Toe`, coordinates: side === 'left' ? { x: [50, 60], y: [380, 390] } : { x: [140, 150], y: [380, 390] } },
  { name: `${side}-second-toe`, displayName: `${side === 'left' ? 'Left' : 'Right'} Second Toe`, coordinates: side === 'left' ? { x: [55, 65], y: [382, 392] } : { x: [135, 145], y: [382, 392] } },
  { name: `${side}-middle-toe`, displayName: `${side === 'left' ? 'Left' : 'Right'} Middle Toe`, coordinates: side === 'left' ? { x: [60, 70], y: [383, 393] } : { x: [130, 140], y: [383, 393] } },
  { name: `${side}-fourth-toe`, displayName: `${side === 'left' ? 'Left' : 'Right'} Fourth Toe`, coordinates: side === 'left' ? { x: [65, 75], y: [382, 392] } : { x: [125, 135], y: [382, 392] } },
  { name: `${side}-pinky-toe`, displayName: `${side === 'left' ? 'Left' : 'Right'} Pinky Toe`, coordinates: side === 'left' ? { x: [70, 80], y: [380, 390] } : { x: [120, 130], y: [380, 390] } },
];

const faceSubRegions: BodyRegion[] = [
  { name: 'forehead', displayName: 'Forehead', coordinates: { x: [85, 115], y: [15, 30] } },
  { name: 'left-eye', displayName: 'Left Eye', coordinates: { x: [85, 95], y: [30, 40] } },
  { name: 'right-eye', displayName: 'Right Eye', coordinates: { x: [105, 115], y: [30, 40] } },
  { name: 'nose', displayName: 'Nose', coordinates: { x: [95, 105], y: [35, 45] } },
  { name: 'mouth', displayName: 'Mouth', coordinates: { x: [90, 110], y: [45, 55] } },
  { name: 'left-ear', displayName: 'Left Ear', coordinates: { x: [75, 85], y: [35, 45] } },
  { name: 'right-ear', displayName: 'Right Ear', coordinates: { x: [115, 125], y: [35, 45] } },
];

const bodyRegions: BodyRegion[] = [
  {
    name: 'head',
    displayName: 'Head',
    coordinates: { x: [70, 130], y: [10, 70] },
    subRegions: [
      { name: 'left-eye', displayName: 'Left Eye', coordinates: { x: [85, 95], y: [30, 40] } },
      { name: 'right-eye', displayName: 'Right Eye', coordinates: { x: [105, 115], y: [30, 40] } },
      { name: 'nose', displayName: 'Nose', coordinates: { x: [95, 105], y: [40, 50] } },
      { name: 'mouth', displayName: 'Mouth', coordinates: { x: [90, 110], y: [45, 55] } },
      { name: 'left-ear', displayName: 'Left Ear', coordinates: { x: [65, 75], y: [30, 40] } },
      { name: 'right-ear', displayName: 'Right Ear', coordinates: { x: [125, 135], y: [30, 40] } },
    ],
  },
  {
    name: 'neck',
    displayName: 'Neck',
    coordinates: { x: [90, 110], y: [70, 90] },
  },
  {
    name: 'chest',
    displayName: 'Chest',
    coordinates: { x: [60, 140], y: [90, 200] },
  },
  {
    name: 'abdomen',
    displayName: 'Abdomen',
    coordinates: { x: [60, 140], y: [200, 300] },
  },
  {
    name: 'left-arm',
    displayName: 'Left Arm',
    coordinates: { x: [30, 60], y: [90, 180] },
    subRegions: [
      { name: 'left-hand', displayName: 'Left Hand', coordinates: { x: [25, 40], y: [180, 190] } },
      { name: 'left-thumb', displayName: 'Left Thumb', coordinates: { x: [25, 35], y: [185, 195] } },
      { name: 'left-index', displayName: 'Left Index Finger', coordinates: { x: [30, 40], y: [190, 200] } },
      { name: 'left-middle', displayName: 'Left Middle Finger', coordinates: { x: [35, 45], y: [192, 202] } },
      { name: 'left-ring', displayName: 'Left Ring Finger', coordinates: { x: [40, 50], y: [190, 200] } },
      { name: 'left-pinky', displayName: 'Left Pinky', coordinates: { x: [45, 55], y: [188, 198] } },
    ],
  },
  {
    name: 'right-arm',
    displayName: 'Right Arm',
    coordinates: { x: [140, 170], y: [90, 180] },
    subRegions: [
      { name: 'right-hand', displayName: 'Right Hand', coordinates: { x: [160, 175], y: [180, 190] } },
      { name: 'right-thumb', displayName: 'Right Thumb', coordinates: { x: [165, 175], y: [185, 195] } },
      { name: 'right-index', displayName: 'Right Index Finger', coordinates: { x: [160, 170], y: [190, 200] } },
      { name: 'right-middle', displayName: 'Right Middle Finger', coordinates: { x: [155, 165], y: [192, 202] } },
      { name: 'right-ring', displayName: 'Right Ring Finger', coordinates: { x: [150, 160], y: [190, 200] } },
      { name: 'right-pinky', displayName: 'Right Pinky', coordinates: { x: [145, 155], y: [188, 198] } },
    ],
  },
  {
    name: 'left-leg',
    displayName: 'Left Leg',
    coordinates: { x: [60, 70], y: [300, 380] },
    subRegions: [
      { name: 'left-foot', displayName: 'Left Foot', coordinates: { x: [50, 75], y: [380, 390] } },
      { name: 'left-big-toe', displayName: 'Left Big Toe', coordinates: { x: [50, 60], y: [380, 390] } },
      { name: 'left-second-toe', displayName: 'Left Second Toe', coordinates: { x: [55, 65], y: [382, 392] } },
      { name: 'left-middle-toe', displayName: 'Left Middle Toe', coordinates: { x: [60, 70], y: [383, 393] } },
      { name: 'left-fourth-toe', displayName: 'Left Fourth Toe', coordinates: { x: [65, 75], y: [382, 392] } },
      { name: 'left-pinky-toe', displayName: 'Left Pinky Toe', coordinates: { x: [70, 80], y: [380, 390] } },
    ],
  },
  {
    name: 'right-leg',
    displayName: 'Right Leg',
    coordinates: { x: [130, 140], y: [300, 380] },
    subRegions: [
      { name: 'right-foot', displayName: 'Right Foot', coordinates: { x: [125, 150], y: [380, 390] } },
      { name: 'right-big-toe', displayName: 'Right Big Toe', coordinates: { x: [140, 150], y: [380, 390] } },
      { name: 'right-second-toe', displayName: 'Right Second Toe', coordinates: { x: [135, 145], y: [382, 392] } },
      { name: 'right-middle-toe', displayName: 'Right Middle Toe', coordinates: { x: [130, 140], y: [383, 393] } },
      { name: 'right-fourth-toe', displayName: 'Right Fourth Toe', coordinates: { x: [125, 135], y: [382, 392] } },
      { name: 'right-pinky-toe', displayName: 'Right Pinky Toe', coordinates: { x: [120, 130], y: [380, 390] } },
    ],
  },
];

const BodyPartSelector: React.FC<BodyPartSelectorProps> = ({ onSelect, selectedPart = null }) => {
  const [showFront, setShowFront] = useState(true);
  const [recentBodyParts, setRecentBodyParts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(selectedPart);

  useEffect(() => {
    setSelectedRegion(selectedPart || null);
  }, [selectedPart]);

  useEffect(() => {
    loadRecentBodyParts();
  }, []);

  const loadRecentBodyParts = async () => {
    setIsLoading(true);
    try {
      const parts = await getFrequentlyUsedBodyParts();
      setRecentBodyParts(parts.map(item => item.name));
    } catch (error) {
      console.error('Error loading recent body parts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    const region = findRegionAtPoint(locationX, locationY);
    if (region) {
      setSelectedRegion(region.name);
      onSelect(region.name);
      setHoveredRegion(null);
    }
  };

  const handleMove = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    const region = findRegionAtPoint(locationX, locationY);
    setHoveredRegion(region?.name || null);
  };

  const findRegionAtPoint = (x: number, y: number): BodyRegion | null => {
    for (const region of bodyRegions) {
      if (isPointInRegion(x, y, region)) {
        if (region.subRegions) {
          const subRegion = region.subRegions.find(sr => isPointInRegion(x, y, sr));
          if (subRegion) return subRegion;
        }
        return region;
      }
    }
    return null;
  };

  const isPointInRegion = (x: number, y: number, region: BodyRegion): boolean => {
    const { coordinates } = region;
    return (
      x >= coordinates.x[0] && x <= coordinates.x[1] &&
      y >= coordinates.y[0] && y <= coordinates.y[1]
    );
  };

  const getDisplayName = (regionName: string | null): string => {
    if (!regionName) return '';
    
    // First check main regions
    const mainRegion = bodyRegions.find(r => r.name === regionName);
    if (mainRegion) return mainRegion.displayName;
    
    // Then check sub-regions
    for (const region of bodyRegions) {
      if (region.subRegions) {
        const subRegion = region.subRegions.find(sr => sr.name === regionName);
        if (subRegion) return subRegion.displayName;
      }
    }
    
    return regionName;
  };

  const renderSelectionFeedback = () => {
    const regionToShow = hoveredRegion || selectedRegion;
    if (!regionToShow) return null;

    return (
      <View style={[
        styles.selectionFeedback,
        Platform.OS === 'web' && styles.selectionFeedbackWeb
      ]}>
        <Text style={styles.selectionText}>
          {getDisplayName(regionToShow)}
        </Text>
      </View>
    );
  };

  const renderBodyMap = () => (
    <View 
      style={styles.bodyMapWrapper}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handlePress}
      onResponderMove={handleMove}
      onResponderRelease={() => setHoveredRegion(null)}
      onResponderTerminate={() => setHoveredRegion(null)}
    >
      <Svg width={svgWidth} height={svgHeight} viewBox="0 0 200 400">
        <G stroke="black" fill="none" strokeWidth="2">
          {/* Head with facial features */}
          <Circle cx="100" cy="40" r="30" fill={hoveredRegion?.includes('head') || selectedRegion?.includes('head') ? '#e6f3ff' : 'none'} />
          <Circle cx="90" cy="35" r="3" fill={hoveredRegion === 'left-eye' || selectedRegion === 'left-eye' ? '#e6f3ff' : 'none'} />
          <Circle cx="110" cy="35" r="3" fill={hoveredRegion === 'right-eye' || selectedRegion === 'right-eye' ? '#e6f3ff' : 'none'} />
          <Path d="M95,40 C97,42 103,42 105,40" fill={hoveredRegion === 'nose' || selectedRegion === 'nose' ? '#e6f3ff' : 'none'} />
          <Path d="M90,45 C95,48 105,48 110,45" fill={hoveredRegion === 'mouth' || selectedRegion === 'mouth' ? '#e6f3ff' : 'none'} />
          <Path d="M70,35 C65,30 65,40 70,35" fill={hoveredRegion === 'left-ear' || selectedRegion === 'left-ear' ? '#e6f3ff' : 'none'} />
          <Path d="M130,35 C135,30 135,40 130,35" fill={hoveredRegion === 'right-ear' || selectedRegion === 'right-ear' ? '#e6f3ff' : 'none'} />

          {/* Neck */}
          <Path d="M90,70 L110,70 L110,90 L90,90 Z" fill={hoveredRegion === 'neck' || selectedRegion === 'neck' ? '#e6f3ff' : 'none'} />

          {/* Torso */}
          <Path 
            d="M60,90 L140,90 L150,200 L130,300 L70,300 L50,200 Z" 
            fill={(hoveredRegion?.includes('chest') || selectedRegion?.includes('chest') || 
                  hoveredRegion?.includes('abdomen') || selectedRegion?.includes('abdomen')) ? '#e6f3ff' : 'none'}
          />

          {/* Left Arm and Hand */}
          <Path 
            d="M60,90 C50,100 40,130 30,180" 
            fill={hoveredRegion?.includes('left-arm') || selectedRegion?.includes('left-arm') ? '#e6f3ff' : 'none'}
          />
          <Path 
            d="M30,180 C28,185 35,195 40,190" 
            fill={hoveredRegion?.includes('left-hand') || selectedRegion?.includes('left-hand') ? '#e6f3ff' : 'none'}
          />
          <Path d="M25,185 L35,195" strokeWidth="3" fill={hoveredRegion === 'left-thumb' || selectedRegion === 'left-thumb' ? '#e6f3ff' : 'none'} />
          <Path d="M30,190 L40,200" strokeWidth="3" fill={hoveredRegion === 'left-index' || selectedRegion === 'left-index' ? '#e6f3ff' : 'none'} />
          <Path d="M35,192 L45,202" strokeWidth="3" fill={hoveredRegion === 'left-middle' || selectedRegion === 'left-middle' ? '#e6f3ff' : 'none'} />
          <Path d="M40,190 L50,200" strokeWidth="3" fill={hoveredRegion === 'left-ring' || selectedRegion === 'left-ring' ? '#e6f3ff' : 'none'} />
          <Path d="M45,188 L55,198" strokeWidth="3" fill={hoveredRegion === 'left-pinky' || selectedRegion === 'left-pinky' ? '#e6f3ff' : 'none'} />

          {/* Right Arm and Hand */}
          <Path 
            d="M140,90 C150,100 160,130 170,180" 
            fill={hoveredRegion?.includes('right-arm') || selectedRegion?.includes('right-arm') ? '#e6f3ff' : 'none'}
          />
          <Path 
            d="M170,180 C172,185 165,195 160,190" 
            fill={hoveredRegion?.includes('right-hand') || selectedRegion?.includes('right-hand') ? '#e6f3ff' : 'none'}
          />
          <Path d="M175,185 L165,195" strokeWidth="3" fill={hoveredRegion === 'right-thumb' || selectedRegion === 'right-thumb' ? '#e6f3ff' : 'none'} />
          <Path d="M170,190 L160,200" strokeWidth="3" fill={hoveredRegion === 'right-index' || selectedRegion === 'right-index' ? '#e6f3ff' : 'none'} />
          <Path d="M165,192 L155,202" strokeWidth="3" fill={hoveredRegion === 'right-middle' || selectedRegion === 'right-middle' ? '#e6f3ff' : 'none'} />
          <Path d="M160,190 L150,200" strokeWidth="3" fill={hoveredRegion === 'right-ring' || selectedRegion === 'right-ring' ? '#e6f3ff' : 'none'} />
          <Path d="M155,188 L145,198" strokeWidth="3" fill={hoveredRegion === 'right-pinky' || selectedRegion === 'right-pinky' ? '#e6f3ff' : 'none'} />

          {/* Left Leg and Foot */}
          <Path 
            d="M70,300 C65,320 62,350 60,380" 
            fill={hoveredRegion?.includes('left-leg') || selectedRegion?.includes('left-leg') ? '#e6f3ff' : 'none'}
          />
          <Path 
            d="M55,380 L70,380 L75,390 L50,390 Z" 
            fill={hoveredRegion?.includes('left-foot') || selectedRegion?.includes('left-foot') ? '#e6f3ff' : 'none'}
          />
          <Path d="M50,380 L60,390" strokeWidth="3" fill={hoveredRegion === 'left-big-toe' || selectedRegion === 'left-big-toe' ? '#e6f3ff' : 'none'} />
          <Path d="M55,382 L65,392" strokeWidth="3" fill={hoveredRegion === 'left-second-toe' || selectedRegion === 'left-second-toe' ? '#e6f3ff' : 'none'} />
          <Path d="M60,383 L70,393" strokeWidth="3" fill={hoveredRegion === 'left-middle-toe' || selectedRegion === 'left-middle-toe' ? '#e6f3ff' : 'none'} />
          <Path d="M65,382 L75,392" strokeWidth="3" fill={hoveredRegion === 'left-fourth-toe' || selectedRegion === 'left-fourth-toe' ? '#e6f3ff' : 'none'} />
          <Path d="M70,380 L80,390" strokeWidth="3" fill={hoveredRegion === 'left-pinky-toe' || selectedRegion === 'left-pinky-toe' ? '#e6f3ff' : 'none'} />

          {/* Right Leg and Foot */}
          <Path 
            d="M130,300 C135,320 138,350 140,380" 
            fill={hoveredRegion?.includes('right-leg') || selectedRegion?.includes('right-leg') ? '#e6f3ff' : 'none'}
          />
          <Path 
            d="M145,380 L130,380 L125,390 L150,390 Z" 
            fill={hoveredRegion?.includes('right-foot') || selectedRegion?.includes('right-foot') ? '#e6f3ff' : 'none'}
          />
          <Path d="M150,380 L140,390" strokeWidth="3" fill={hoveredRegion === 'right-big-toe' || selectedRegion === 'right-big-toe' ? '#e6f3ff' : 'none'} />
          <Path d="M145,382 L135,392" strokeWidth="3" fill={hoveredRegion === 'right-second-toe' || selectedRegion === 'right-second-toe' ? '#e6f3ff' : 'none'} />
          <Path d="M140,383 L130,393" strokeWidth="3" fill={hoveredRegion === 'right-middle-toe' || selectedRegion === 'right-middle-toe' ? '#e6f3ff' : 'none'} />
          <Path d="M135,382 L125,392" strokeWidth="3" fill={hoveredRegion === 'right-fourth-toe' || selectedRegion === 'right-fourth-toe' ? '#e6f3ff' : 'none'} />
          <Path d="M130,380 L120,390" strokeWidth="3" fill={hoveredRegion === 'right-pinky-toe' || selectedRegion === 'right-pinky-toe' ? '#e6f3ff' : 'none'} />
        </G>
      </Svg>
      {renderSelectionFeedback()}
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          {recentBodyParts.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentContainer}>
              {recentBodyParts.map((part, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedRegion(part);
                    onSelect(part);
                  }}
                  style={[
                    styles.recentPart,
                    selectedRegion === part && styles.selectedRecentPart
                  ]}
                >
                  <Text style={[
                    styles.recentPartText,
                    selectedRegion === part && styles.selectedRecentPartText
                  ]}>
                    {getDisplayName(part)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {renderBodyMap()}
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setShowFront(!showFront)}
          >
            <MaterialCommunityIcons name="rotate-3d" size={24} color="black" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: svgHeight,
  },
  recentContainer: {
    marginBottom: 16,
  },
  bodyMapWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: svgWidth,
    height: svgHeight,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  selectionFeedback: {
    position: 'absolute',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
  selectionFeedbackWeb: {
    transform: [{ translateY: -20 }],
  },
  selectionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flipButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recentPart: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedRecentPart: {
    backgroundColor: '#007AFF',
  },
  recentPartText: {
    color: '#333',
  },
  selectedRecentPartText: {
    color: '#fff',
  },
});

export default BodyPartSelector; 