'use client';

import { useState } from 'react';
import FlightCalendar from './FlightCalendar';
import FlightModal from './FlightModal';
import { Flight } from '@/lib/queries';

interface FlightCalendarWrapperProps {
  flights: Flight[];
  origin?: string;
  destination?: string;
  originDisplay?: string;
  destinationDisplay?: string;
}

export default function FlightCalendarWrapper({ 
  flights, 
  origin, 
  destination, 
  originDisplay, 
  destinationDisplay 
}: FlightCalendarWrapperProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };

  // Filter flights for selected date (if we had date info, otherwise show all)
  const flightsForDate = selectedDate ? flights : flights;

  return (
    <>
      <FlightCalendar 
        flights={flights} 
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
      {origin && destination && (
        <FlightModal
          open={modalOpen}
          onClose={handleCloseModal}
          origin={origin}
          destination={destination}
          originDisplay={originDisplay}
          destinationDisplay={destinationDisplay}
        />
      )}
    </>
  );
}

