"use client";

import { useState, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: false,
  });

  const setCoordinates = useCallback((lat: number, lng: number) => {
    setState({ latitude: lat, longitude: lng, error: null, isLoading: false });
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation not supported" }));
      return;
    }

    setState((s) => ({ ...s, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        setState((s) => ({
          ...s,
          error: error.message,
          isLoading: false,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { ...state, requestLocation, setCoordinates };
}
