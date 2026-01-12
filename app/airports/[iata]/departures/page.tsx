import { Metadata } from 'next';
import { Container, Typography, Box, Paper } from '@mui/material';
import { getAirportSummary, getDepartures, getArrivals } from '@/lib/queries';
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

// SSR for dynamic departures data
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const iata = params.iata.toUpperCase();
  const airport = await getAirportSummary(iata);
  
  const title = airport
    ? `Departures from ${iata} Airport - Real-time Flight Information`
    : `Departures from ${iata} Airport`;
  
  const description = airport
    ? `Real-time departure information for ${iata} Airport. View all departing flights, schedules, and airline information.`
    : `View departing flights from ${iata} Airport.`;

  return genMeta({
    title,
    description,
    canonical: `/airports/${iata.toLowerCase()}/departures`,
  });
}

export default async function DeparturesPage({ params }: PageProps) {
  const iata = params.iata.toUpperCase();
  const airport = await getAirportSummary(iata);
  const departures = await getDepartures(iata, 100);
  const arrivals = await getArrivals(iata, 100);

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
    { name: 'Departures', url: `${siteUrl}/airports/${iata.toLowerCase()}/departures` },
  ]);

  const airportDisplay = formatAirportDisplay(iata, airport.city);
  const introText = `There are ${departures.length} departing flights from ${airportDisplay}. All times are in local time.`;
  const faqs = await generateAirportFAQs(airport, departures, arrivals, 0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Airports', href: '/airports' },
          { label: airportDisplay, href: `/airports/${iata.toLowerCase()}` },
          { label: 'Departures', href: `/airports/${iata.toLowerCase()}/departures` },
        ]}
      />
      
      <JsonLd data={breadcrumbData} />

      <Typography variant="h1" gutterBottom sx={{ textAlign: 'left' }}>
        Departures from {airportDisplay}
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
        {introText}
      </Typography>

      <Box sx={{ mb: 4 }}>
        <FlightTable flights={departures} showDestination />
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

