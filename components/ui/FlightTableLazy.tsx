import dynamic from 'next/dynamic';

const FlightTable = dynamic(() => import('./FlightTable'), {
  ssr: true,
  loading: () => (
    <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Loading flight data...</p>
    </div>
  ),
});

export default FlightTable;

