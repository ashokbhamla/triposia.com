import dynamic from 'next/dynamic';

const FlightCalendarWrapper = dynamic(() => import('./FlightCalendarWrapper'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Loading calendar...</p>
    </div>
  ),
});

export default FlightCalendarWrapper;

