import dynamic from 'next/dynamic';

const PriceStatistics = dynamic(() => import('./PriceStatistics'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Loading price statistics...</p>
    </div>
  ),
});

export default PriceStatistics;

