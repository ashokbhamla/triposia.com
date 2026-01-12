import { Metadata } from 'next';
import { Container, Typography, Box, Paper } from '@mui/material';
import { getAirportSummary, getArrivals, getDepartures } from '@/lib/queries';
import { generateMetadata as genMeta, generateBreadcrumbList } from '@/lib/seo';
import { formatAirportDisplay } from '@/lib/formatting';
import { generateAirportFAQs } from '@/lib/faqGenerators';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import FlightTable from '@/components/ui/FlightTable';

interface PageProps {
  params: {
    iata: string;
  };
}

// SSR for dynamic arrivals data
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const iata = params.iata.toUpperCase();
  const airport = await getAirportSummary(iata);
  
  const title = airport
    ? `Arrivals at ${iata} Airport - Real-time Flight Information`
    : `Arrivals at ${iata} Airport`;
  
  const description = airport
    ? `Real-time arrival information for ${iata} Airport. View all arriving flights, schedules, and airline information.`
    : `View arriving flights at ${iata} Airport.`;

  return genMeta({
    title,
    description,
    canonical: `/airports/${iata.toLowerCase()}/arrivals`,
  });
}

export default async function ArrivalsPage({ params }: PageProps) {
  const iata = params.iata.toUpperCase();
  const airport = await getAirportSummary(iata);
  const arrivals = await getArrivals(iata, 100);
  const departures = await getDepartures(iata, 100);

  if (!airport) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Airport {iata} Not Found
        </Typography>
      </Container>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://triposia.com';
  const breadcrumbData = generateBreadcrumbList([
    { name: 'Home', url: siteUrl },
    { name: 'Airports', url: `${siteUrl}/airports` },
    { name: `${iata} Airport`, url: `${siteUrl}/airports/${iata.toLowerCase()}` },
    { name: 'Arrivals', url: `${siteUrl}/airports/${iata.toLowerCase()}/arrivals` },
  ]);

  const airportDisplay = formatAirportDisplay(iata, airport.city);
  const introText = `There are ${arrivals.length} arriving flights at ${airportDisplay}. All times are in local time.`;
  const faqs = await generateAirportFAQs(airport, departures, arrivals, 0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Airports', href: '/airports' },
          { label: airportDisplay, href: `/airports/${iata.toLowerCase()}` },
          { label: 'Arrivals', href: `/airports/${iata.toLowerCase()}/arrivals` },
        ]}
      />
      
      <JsonLd data={breadcrumbData} />

      <Typography variant="h1" gutterBottom sx={{ textAlign: 'left' }}>
        Arrivals at {airportDisplay}
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
        {introText}
      </Typography>

      <Box sx={{ mb: 4 }}>
        <FlightTable flights={arrivals} showOrigin />
      </Box>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2, textAlign: 'left' }}>
            Frequently Asked Questions
          </Typography>
          <Paper sx={{ p: 3 }}>
            {faqs.map((faq, idx) => (
              <Box key={idx} sx={{ mb: idx < faqs.length - 1 ? 3 : 0 }}>
                <Typography variant="h3" sx={{ fontSize: '1.25rem', mb: 1, textAlign: 'left' }}>
                  {faq.question}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      )}
    </Container>
  );
}

