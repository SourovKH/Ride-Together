import { useState, useEffect, useCallback } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null; // in km/h
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unknown';

export interface UseGeolocationReturn {
  location: LocationData | null;
  error: GeolocationError | null;
  permissionStatus: PermissionState;
  isTracking: boolean;
  requestPermission: () => void;
}

export const useGeolocation = (enabled: boolean = true): UseGeolocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('unknown');
  const [isTracking, setIsTracking] = useState<boolean>(false);

  // Check browser permission status if Permissions API is available
  useEffect(() => {
    if (!('navigator' in window) || !('geolocation' in navigator)) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permission) => {
          setPermissionStatus(permission.state as PermissionState);
          permission.onchange = () => {
            setPermissionStatus(permission.state as PermissionState);
          };
        })
        .catch(() => {
          setPermissionStatus('unknown');
        });
    }
  }, []);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy, heading, speed } = position.coords;
    
    // Convert m/s to km/h if speed is present
    const speedKmH = speed !== null && speed >= 0 ? Math.round(speed * 3.6 * 10) / 10 : 0;

    setLocation({
      latitude,
      longitude,
      accuracy: Math.round(accuracy),
      heading: heading !== null ? Math.round(heading) : null,
      speed: speedKmH,
      timestamp: position.timestamp,
    });
    setError(null);
    setPermissionStatus('granted');
    setIsTracking(true);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let message = 'An unknown geolocation error occurred.';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        message = 'Location permission was denied by user or browser.';
        setPermissionStatus('denied');
        break;
      case err.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable from GPS.';
        break;
      case err.TIMEOUT:
        message = 'Location request timed out.';
        break;
    }

    setError({
      code: err.code,
      message,
    });
    setIsTracking(false);
  }, []);

  const requestPermission = useCallback(() => {
    if (!('geolocation' in navigator)) return;

    setError(null);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, [handleSuccess, handleError]);

  useEffect(() => {
    if (!enabled) {
      setIsTracking(false);
      return;
    }

    if (!('geolocation' in navigator)) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setIsTracking(true);

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    };
  }, [enabled, handleSuccess, handleError]);

  return {
    location,
    error,
    permissionStatus,
    isTracking,
    requestPermission,
  };
};
