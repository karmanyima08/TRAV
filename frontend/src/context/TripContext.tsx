import React, { createContext, useContext, useState } from 'react';
import { Itinerary } from '../services/types';

interface TripContextType {
  currentTrip: any | null;
  setCurrentTrip: (trip: any) => void;
  generatedItinerary: Itinerary | null;
  setGeneratedItinerary: (itinerary: Itinerary | null) => void;
  activeDay: number;
  setActiveDay: (day: number) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
}

const TripContext = createContext<TripContextType>({} as TripContextType);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrip, setCurrentTrip] = useState<any | null>(null);
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

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
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);

