import { useState, useEffect, useCallback } from 'react';

export type ScreenMode = 'auto' | 'mobile' | 'tablet' | 'desktop';
export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';
export type ScreenOrientation = 'portrait' | 'landscape';

export interface ScreenState {
  // Configured mode by user
  mode: ScreenMode;
  setMode: (mode: ScreenMode) => void;

  // Real browser window metrics
  windowWidth: number;
  windowHeight: number;
  actualCategory: DeviceCategory;
  orientation: ScreenOrientation;
  isTouchDevice: boolean;
  pixelRatio: number;

  // Effective layout values (considering simulation modes or auto)
  effectiveCategory: DeviceCategory;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSimulated: boolean;

  // Simulated orientation for mobile/tablet preview
  simulatedOrientation: ScreenOrientation;
  toggleSimulatedOrientation: () => void;
}

export function useScreenAdaptor(): ScreenState {
  const [mode, setModeState] = useState<ScreenMode>(() => {
    try {
      const saved = localStorage.getItem('budgetin_screen_mode');
      if (saved === 'auto' || saved === 'mobile' || saved === 'tablet' || saved === 'desktop') {
        return saved;
      }
      return 'auto';
    } catch {
      return 'auto';
    }
  });

  const [simulatedOrientation, setSimulatedOrientation] = useState<ScreenOrientation>('portrait');

  const [windowDimensions, setWindowDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1200, height: 800, pixelRatio: 1, isTouch: false };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      isTouch: window.matchMedia('(pointer: coarse)').matches,
    };
  });

  // Real-time resize listener for automatic screen adaptation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1,
        isTouch: window.matchMedia('(pointer: coarse)').matches,
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const setMode = useCallback((newMode: ScreenMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('budgetin_screen_mode', newMode);
    } catch {
      // ignore
    }
  }, []);

  const toggleSimulatedOrientation = useCallback(() => {
    setSimulatedOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  }, []);

  // Compute actual device category based on window width
  const actualCategory: DeviceCategory =
    windowDimensions.width < 768
      ? 'mobile'
      : windowDimensions.width < 1024
      ? 'tablet'
      : 'desktop';

  const orientation: ScreenOrientation =
    windowDimensions.width < windowDimensions.height ? 'portrait' : 'landscape';

  // Compute effective layout category
  let effectiveCategory: DeviceCategory = actualCategory;
  let isSimulated = false;

  if (mode === 'mobile') {
    effectiveCategory = 'mobile';
    isSimulated = true;
  } else if (mode === 'tablet') {
    effectiveCategory = 'tablet';
    isSimulated = true;
  } else if (mode === 'desktop') {
    effectiveCategory = 'desktop';
    isSimulated = actualCategory !== 'desktop';
  } else {
    // Mode 'auto' responds directly to actual screen size
    effectiveCategory = actualCategory;
    isSimulated = false;
  }

  const isMobile = effectiveCategory === 'mobile';
  const isTablet = effectiveCategory === 'tablet';
  const isDesktop = effectiveCategory === 'desktop';

  return {
    mode,
    setMode,
    windowWidth: windowDimensions.width,
    windowHeight: windowDimensions.height,
    actualCategory,
    orientation,
    isTouchDevice: windowDimensions.isTouch,
    pixelRatio: windowDimensions.pixelRatio,
    effectiveCategory,
    isMobile,
    isTablet,
    isDesktop,
    isSimulated,
    simulatedOrientation,
    toggleSimulatedOrientation,
  };
}
