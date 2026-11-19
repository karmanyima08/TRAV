import React, { createContext, useContext, useState, useEffect } from 'react';
import { Itinerary } from '../services/types';

export interface WizardDraft {
  destination: string;
  startDate: string;
  numDays: number;
  travelers: number;
  travelType: string;
  budget: number;
  budgetCategory: string;
  interests: string[];
  dietary: string[];
  walkingComfort: string;
  accessibility: boolean;
  transport: string;
  step: number;
}

interface TripContextType {
  currentTrip: any | null;
  setCurrentTrip: (trip: any) => void;
  generatedItinerary: Itinerary | null;
  setGeneratedItinerary: (itinerary: Itinerary | null) => void;
  activeDay: number;
  setActiveDay: (day: number) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  savedTrips: any[];
  saveTrip: (trip: any) => void;
  deleteSavedTrip: (tripId: string) => void;
  wizardDraft: WizardDraft | null;
  setWizardDraft: (draft: WizardDraft | null) => void;
  clearWizardDraft: () => void;
}

const TripContext = createContext<TripContextType>({} as TripContextType);

const STORAGE_KEY_CURRENT_TRIP = 'travora_current_trip';
const STORAGE_KEY_ITINERARY = 'travora_itinerary';
const STORAGE_KEY_SAVED_TRIPS = 'travora_saved_trips';
const STORAGE_KEY_DRAFT = 'travora_wizard_draft';

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrip, setCurrentTripState] = useState<any | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CURRENT_TRIP);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [generatedItinerary, setGeneratedItineraryState] = useState<Itinerary | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ITINERARY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [savedTrips, setSavedTrips] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED_TRIPS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [wizardDraft, setWizardDraftState] = useState<WizardDraft | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DRAFT);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeDay, setActiveDay] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const setCurrentTrip = (trip: any) => {
    setCurrentTripState(trip);
    try {
      if (trip) {
        localStorage.setItem(STORAGE_KEY_CURRENT_TRIP, JSON.stringify(trip));
        // Also ensure it is present in savedTrips
        saveTrip(trip);
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_TRIP);
      }
    } catch (e) {
      console.warn('Failed to persist currentTrip to localStorage', e);
    }
  };

  const setGeneratedItinerary = (itinerary: Itinerary | null) => {
    setGeneratedItineraryState(itinerary);
    try {
      if (itinerary) {
        localStorage.setItem(STORAGE_KEY_ITINERARY, JSON.stringify(itinerary));
      } else {
        localStorage.removeItem(STORAGE_KEY_ITINERARY);
      }
    } catch (e) {
      console.warn('Failed to persist itinerary to localStorage', e);
    }
  };

  const saveTrip = (trip: any) => {
    if (!trip || !trip.id) return;
    setSavedTrips((prev) => {
      const existsIndex = prev.findIndex((t) => t.id === trip.id);
      let updated: any[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = { ...prev[existsIndex], ...trip };
      } else {
        updated = [trip, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_KEY_SAVED_TRIPS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save trips to localStorage', e);
      }
      return updated;
    });
  };

  const deleteSavedTrip = (tripId: string) => {
    setSavedTrips((prev) => {
      const updated = prev.filter((t) => t.id !== tripId);
      try {
        localStorage.setItem(STORAGE_KEY_SAVED_TRIPS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update saved trips in localStorage', e);
      }
      return updated;
    });
    if (currentTrip?.id === tripId) {
      setCurrentTrip(null);
      setGeneratedItinerary(null);
    }
  };

  const setWizardDraft = (draft: WizardDraft | null) => {
    setWizardDraftState(draft);
    try {
      if (draft) {
        localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
      } else {
        localStorage.removeItem(STORAGE_KEY_DRAFT);
      }
    } catch (e) {
      console.warn('Failed to persist wizard draft', e);
    }
  };

  const clearWizardDraft = () => {
    setWizardDraftState(null);
    try {
      localStorage.removeItem(STORAGE_KEY_DRAFT);
    } catch (e) {
      console.warn('Failed to clear wizard draft', e);
    }
  };

  return (
    <TripContext.Provider
      value={{
        currentTrip,
        setCurrentTrip,
        generatedItinerary,
        setGeneratedItinerary,
        activeDay,
        setActiveDay,
        isGenerating,
        setIsGenerating,
        savedTrips,
        saveTrip,
        deleteSavedTrip,
        wizardDraft,
        setWizardDraft,
        clearWizardDraft,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
