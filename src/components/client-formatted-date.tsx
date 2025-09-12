"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';

interface ClientFormattedDateProps {
  dateString: string; // Expects a string like "Mon Jul 21 2025" from toDateString()
  options?: Intl.DateTimeFormatOptions;
}

const ClientFormattedDate: FC<ClientFormattedDateProps> = ({ dateString, options }) => {
  // Initialize with the raw dateString to match server render and avoid initial mismatch.
  // The client-side useEffect will then update this to the localized format.
  const [formattedDate, setFormattedDate] = useState<string>(dateString); 

  useEffect(() => {
    // This effect runs only on the client, after initial hydration.
    const dateObj = new Date(dateString);
    // Ensure the date object is valid before attempting to format.
    if (!isNaN(dateObj.getTime())) {
      setFormattedDate(dateObj.toLocaleDateString(undefined, options));
    } else {
      // Fallback for invalid date strings, though toDateString() output should be parseable.
      setFormattedDate("Invalid Date"); 
    }
  }, [dateString, options]); // Dependencies: re-run if dateString or options change.

  return <>{formattedDate}</>;
};

export default ClientFormattedDate;
