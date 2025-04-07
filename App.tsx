import { StyleSheet, Text, View, TouchableOpacity, Animated, Pressable, PanResponder, SafeAreaView, Platform, StatusBar, AppState, ImageBackground, Image, Button } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { findNodeHandle } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';

// Types
type Suit = 'Spades' | 'Hearts' | 'Clubs' | 'Diamonds';
type CardValue = string;
type Card = { value: CardValue; suit: Suit };
type TimeState = { hours: string; minutes: string; customSeconds: number };

// Helper functions
const getSuitEmoji = (suit: Suit): string => {
  switch (suit) {
    case 'Spades': return '♠';
    case 'Hearts': return '♥';
    case 'Clubs': return '♣';
    case 'Diamonds': return '♦';
    default: return '';
  }
};

const getSuitColor = (suit: Suit): string => 
  (suit === 'Hearts' || suit === 'Diamonds') ? '#ff0000' : '#000000';

const getCardValue = (seconds: number): CardValue => {
  if (seconds === 11) return 'J';
  if (seconds === 12) return 'Q';
  if (seconds === 13) return 'K';
  if (seconds === 1) return 'A';
  return String(seconds);
};

// Card Component
const PlayingCard = ({ card, animations, panHandlers }: { 
  card: Card, 
  animations: {
    isDragging: boolean,
    cardPosition: string,
    fadeAnim: Animated.Value,
    floatAnim: Animated.Value,
    rotateAnim: Animated.Value,
    moveXAnim: Animated.Value,
  },
  panHandlers: any
}) => {
  const { isDragging, cardPosition, floatAnim, rotateAnim, moveXAnim } = animations;
  
  return (
    <Animated.View 
      {...panHandlers}
      style={[
        styles.cardContainer,
        {
          transform: [
            { translateX: isDragging 
              ? panHandlers.panX 
              : cardPosition === 'center' 
                ? moveXAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [-10, 10, -10]
                  })
                : moveXAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [30, 50, 30]
                  })
            },
            { translateY: isDragging
              ? panHandlers.panY
              : floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10]
                })
            },
            { rotateX: isDragging 
              ? '0deg'
              : floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', cardPosition === 'center' ? '3deg' : '5deg']
                })
            },
            { rotateY: isDragging
              ? '0deg'
              : rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    cardPosition === 'center' ? '-2deg' : '-5deg', 
                    cardPosition === 'center' ? '5deg' : '8deg'
                  ]
                })
            },
            { rotateZ: isDragging
              ? '0deg'
              : rotateAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [
                    cardPosition === 'center' ? '-1deg' : '-3deg',
                    '0deg',
                    cardPosition === 'center' ? '1deg' : '3deg'
                  ]
                })
            }
          ],
          shadowOpacity: floatAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 0.8]
          })
        }
      ]}
      pointerEvents="box-only"
    >
      <View pointerEvents="none" style={styles.cardInnerContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid meet">
          {/* Card background */}
          <Rect
            x="0"
            y="0"
            width="400"
            height="560"
            rx="16"
            ry="16"
            fill="white"
            stroke="#000"
            strokeWidth="1.5"
          />
          
          {/* Top left value and suit - align with the same x-coordinate */}
          <SvgText
            x="35"
            y="60"
            fontSize="48"
            fontWeight="bold"
            textAnchor="middle"
            fill={getSuitColor(card.suit)}
          >
            {card.value}
          </SvgText>
          
          <SvgText
            x="35"
            y="110"
            fontSize="48"
            textAnchor="middle"
            fill={getSuitColor(card.suit)}
          >
            {getSuitEmoji(card.suit)}
          </SvgText>
          
          {/* Bottom right suit and value - rotated 180 degrees with value below suit */}
          <SvgText
            x="365"
            y="450"
            fontSize="48"
            textAnchor="middle"
            fill={getSuitColor(card.suit)}
            rotation="180"
            origin="365, 450"
          >
            {getSuitEmoji(card.suit)}
          </SvgText>
          
          <SvgText
            x="365"
            y="500"
            fontSize="48"
            fontWeight="bold"
            textAnchor="middle"
            fill={getSuitColor(card.suit)}
            rotation="180"
            origin="365, 500"
          >
            {card.value}
          </SvgText>
          
          {/* Center suit large - adjusted to be perfectly centered */}
          <SvgText
            x="200"
            y="280"
            fontSize="180"
            textAnchor="middle"
            alignmentBaseline="middle"
            fill={getSuitColor(card.suit)}
          >
            {getSuitEmoji(card.suit)}
          </SvgText>
        </Svg>
        <View style={styles.cardOverlay} />
      </View>
    </Animated.View>
  );
};

// Clock component
const Clock = ({ time }: { time: TimeState }) => (
  <View style={styles.counterContainer}>
    <Text style={styles.hourMinuteText}>
      {time.hours}:{time.minutes}
    </Text>
    <Text style={styles.secondsText}>
      {String(time.customSeconds).padStart(2, '0')}
    </Text>
  </View>
);

// Main App / ParallelUniverse Component
export default function App() {
  // Enable keep awake to prevent screen from turning off
  useKeepAwake();
  
  // State
  const [time, setTime] = useState<TimeState>({
    hours: '00',
    minutes: '00',
    customSeconds: 1
  });
  
  const [cardVisible, setCardVisible] = useState(false);
  const [cardExiting, setCardExiting] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card>({ value: '', suit: 'Spades' });
  const [cardPosition, setCardPosition] = useState('center');
  const [isDragging, setIsDragging] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const moveXAnim = useRef(new Animated.Value(0)).current;
  const exitAnim = useRef(new Animated.Value(0)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const swipeTextAnim = useRef(new Animated.Value(0)).current;

  // Reset animations function
  const resetAnimations = useCallback(() => {
    floatAnim.setValue(0);
    rotateAnim.setValue(0);
    moveXAnim.setValue(0);
    panX.setValue(0);
    panY.setValue(0);
    exitAnim.setValue(0);
    setCardPosition('center');
    setIsDragging(false);
    setCardExiting(false);
  }, [floatAnim, rotateAnim, moveXAnim, panX, panY, exitAnim]);

  // Pan responder for card dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        const currentX = (panX as any)._value || 0;
        const currentY = (panY as any)._value || 0;
        panX.setOffset(currentX);
        panY.setOffset(currentY);
        panX.setValue(0);
        panY.setValue(0);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: panX, dy: panY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        setCardVisible(false);
        setIsDragging(false);
        
        panX.setOffset(0);
        panY.setOffset(0);
        panX.setValue(0);
        panY.setValue(0);
      }
    })
  ).current;

  // Time update effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(prev => ({
        hours: String(now.getHours()).padStart(2, '0'),
        minutes: String(now.getMinutes()).padStart(2, '0'),
        customSeconds: prev.customSeconds >= 13 ? 1 : prev.customSeconds + 1
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Card visibility animations effect
  useEffect(() => {
    if (cardVisible) {
      fadeAnim.setValue(0);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      
      // Floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 3000,
            easing: (t) => Math.sin(t * Math.PI),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3000, 
            easing: (t) => Math.sin(t * Math.PI),
            useNativeDriver: true,
          })
        ])
      ).start();
      
      // Horizontal movement animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(moveXAnim, {
            toValue: 1,
            duration: 4000,
            easing: (t) => Math.sin(t * Math.PI * 2),
            useNativeDriver: true,
          }),
          Animated.timing(moveXAnim, {
            toValue: 0,
            duration: 4000,
            easing: (t) => Math.sin(t * Math.PI * 2),
            useNativeDriver: true,
          })
        ])
      ).start();
      
      // Rotation animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [cardVisible, fadeAnim, floatAnim, moveXAnim, rotateAnim]);

  // Hide Android status bar and navigation bar effect
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setHidden(true);
      
      // For Android, we need to set the navigation bar to be hidden
      // This will make the app truly full screen
      const hideNavigationBar = () => {
        try {
          if (StatusBar.setTranslucent) {
            StatusBar.setTranslucent(true);
          }
          
          // Try to use the current API
          const currentApiLevel = Platform.Version as number;
          
          if (currentApiLevel >= 19) {
            // For Android 4.4+ we can use setSystemUiVisibility
            const SystemUiVisibility = {
              SYSTEM_UI_FLAG_LAYOUT_STABLE: 0x00000100,
              SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION: 0x00000200,
              SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN: 0x00000400,
              SYSTEM_UI_FLAG_HIDE_NAVIGATION: 0x00000002,
              SYSTEM_UI_FLAG_FULLSCREEN: 0x00000004,
              SYSTEM_UI_FLAG_IMMERSIVE: 0x00000800,
              SYSTEM_UI_FLAG_IMMERSIVE_STICKY: 0x00001000,
            };
            
            const UIManager = require('react-native').UIManager;
            const Constants = UIManager.getConstants();
            
            if (Constants && Constants.ViewManagerNames && Constants.ViewManagerNames.includes('AndroidFullScreenView')) {
              UIManager.dispatchViewManagerCommand(
                findNodeHandle(null),
                UIManager.getViewManagerConfig('AndroidFullScreenView').Commands.setSystemUiVisibility,
                [
                  SystemUiVisibility.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                  SystemUiVisibility.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                  SystemUiVisibility.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                  SystemUiVisibility.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                  SystemUiVisibility.SYSTEM_UI_FLAG_FULLSCREEN |
                  SystemUiVisibility.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                ]
              );
            }
          }
        } catch (e) {
          console.error('Failed to set full screen mode:', e);
        }
      };
      
      hideNavigationBar();
      // Re-hide nav bar when app comes to foreground
      const appStateListener = AppState.addEventListener('change', (nextAppState: string) => {
        if (nextAppState === 'active') {
          hideNavigationBar();
        }
      });
      
      return () => {
        appStateListener.remove();
      };
    } else if (Platform.OS === 'ios') {
      // For iOS, we make sure status bar is hidden
      StatusBar.setHidden(true, 'none');
    }
  }, []);

  // Handle suit selection
  const handleSuitPress = useCallback((suit: Suit) => {
    const cardShortValue = getCardValue(time.customSeconds);
    
    if (cardVisible) {
      setCardVisible(false);
      
      setTimeout(() => {
        resetAnimations();
        setSelectedCard({ value: cardShortValue, suit });
        setCardVisible(true);
      }, 100);
    } else {
      resetAnimations();
      setSelectedCard({ value: cardShortValue, suit });
      setCardVisible(true);
    }
  }, [time.customSeconds, cardVisible, resetAnimations]);

  // Handle card overlay press
  const handleOverlayPress = useCallback(() => {
    if (cardExiting) return;
    setCardVisible(false);
  }, [cardExiting]);

  // Add bounce animation for the swipe text
  useEffect(() => {
    const startBounceAnimation = () => {
      // Reset animation value
      swipeTextAnim.setValue(0);
      
      // Create the bounce sequence
      Animated.sequence([
        Animated.timing(swipeTextAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(swipeTextAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(swipeTextAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(swipeTextAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    };

    // Initial animation
    startBounceAnimation();
    
    // Set up interval to repeat the animation every 8 seconds
    const interval = setInterval(startBounceAnimation, 8000);
    
    return () => clearInterval(interval);
  }, [swipeTextAnim]);

  return (
    <View style={styles.backgroundContainer}>
      {Platform.OS === 'android' ? (
        // On Android, use Image with drawable resource
        <Image 
          source={{ uri: 'drawable/lock_screen' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      ) : (
        // On iOS, use Image with require
        <Image 
          source={require('./src/assets/lock-screen.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" hidden={true} />
        
        {/* Suit selection grid */}
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            <TouchableOpacity 
              style={styles.suitBox} 
              onPress={() => handleSuitPress('Spades')} 
              activeOpacity={0.7}
            >
              <Text style={styles.suitText}>♠️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.suitBox} 
              onPress={() => handleSuitPress('Hearts')} 
              activeOpacity={0.7}
            >
              <Text style={styles.suitText}>♥️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity 
              style={styles.suitBox} 
              onPress={() => handleSuitPress('Clubs')} 
              activeOpacity={0.7}
            >
              <Text style={styles.suitText}>♣️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.suitBox} 
              onPress={() => handleSuitPress('Diamonds')} 
              activeOpacity={0.7}
            >
              <Text style={styles.suitText}>♦️</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Clock overlay - placing it after the grid so it's visually on top */}
        <Clock time={time} />
        
        {/* Swipe up indicator text */}
        <View style={styles.swipeUpContainer}>
          <Animated.Text 
            style={[
              styles.swipeUpText,
              {
                transform: [
                  {
                    translateY: swipeTextAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -15]
                    })
                  }
                ]
              }
            ]}
          >
            swipe up to unlock
          </Animated.Text>
        </View>

        {/* Card Overlay */}
        {cardVisible && (
          <Animated.View style={[styles.cardOverlayContainer, { opacity: fadeAnim }]}>
            <Pressable style={styles.cardOverlayPressable} onPress={handleOverlayPress}>
              <PlayingCard 
                card={selectedCard} 
                animations={{
                  isDragging,
                  cardPosition,
                  fadeAnim,
                  floatAnim,
                  rotateAnim,
                  moveXAnim
                }}
                panHandlers={{
                  ...panResponder.panHandlers,
                  panX,
                  panY
                }}
              />
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Platform.OS === 'android' ? '#0C3D14' : undefined, // Dark green background for Android
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Darker overlay for better visibility
    ...Platform.select({
      android: {
        paddingTop: 0,
        paddingBottom: 0,
      },
      ios: {
        paddingBottom: 0,
      }
    }),
  },
  counterContainer: {
    position: 'absolute',
    top: 120,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 5, // Reduce z-index so the clock is visible but doesn't block touch events
    pointerEvents: 'none', // Make the clock non-interactive so touches pass through
  },
  lockIconContainer: {
    position: 'absolute',
    top: 20,
    width: '100%',
    alignItems: 'center',
    zIndex: 9,
  },
  lockIcon: {
    fontSize: 20,
    color: '#999',
  },
  hourMinuteText: {
    color: '#fff',
    fontSize: 120,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-light',
    fontWeight: '300',
    opacity: 1,
    letterSpacing: -2,
  },
  secondsText: {
    color: '#fff',
    fontSize: 30,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-light',
    fontWeight: '300',
    opacity: 0.8,
    marginTop: -15,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: '100%',
    height: '100%',
    position: 'absolute', // Make it absolute to cover the full screen
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Lower than the clock visually but higher for touch events
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    flex: 1,
  },
  suitBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  suitText: {
    fontSize: 0,
    textAlign: 'center',
    opacity: 0,
  },
  cardOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardOverlayPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: 340,
    height: 476,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
    pointerEvents: 'box-only',
  },
  cardInnerContainer: {
    width: '100%', 
    height: '100%'
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent'
  },
  swipeUpContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    zIndex: 5,
  },
  swipeUpText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-light',
    fontWeight: '300',
    opacity: 0.8,
    letterSpacing: 1,
  },
});
