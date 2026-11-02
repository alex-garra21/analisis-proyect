import React from 'react';

interface CalendarLinkProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable component to link to the Google Calendar event for the Congress.
 * This centralizes the event details (date, title, location).
 */
export default function CalendarLink({ children, className, style }: CalendarLinkProps) {
  const calendarUrl = "https://www.google.com/calendar/render?action=TEMPLATE&text=COMERCIAL+FLORES+DEL+CAMPO&dates=20260523T140000Z/20260524T000000Z&details=El+evento+académico+más+importante+del+año.&location=Hotel+Alcazar+doña+Victoria,+Cobán";

  return (
    <a 
      href={calendarUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{ textDecoration: 'none', ...style }}
    >
      {children}
    </a>
  );
}
