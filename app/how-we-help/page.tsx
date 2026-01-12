import { Metadata } from 'next';
import { Container, Typography, Box, Paper } from '@mui/material';
import { generateMetadata as genMeta, generateBreadcrumbList } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from 'next/link';
import { COMPANY_INFO, getSiteUrl } from '@/lib/company';

export const metadata: Metadata = genMeta({
  title: `How We Help Travelers - ${COMPANY_INFO.name}`,
  description: `How ${COMPANY_INFO.name} helps you make informed flight decisions through accurate data, route insights, and practical travel information.`,
  canonical: '/how-we-help',
});

// Make dynamic to prevent build timeouts
export const dynamic = 'force-dynamic';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: COMPANY_INFO.name,
  url: COMPANY_INFO.website,
  email: COMPANY_INFO.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: COMPANY_INFO.address.street,
    addressLocality: COMPANY_INFO.address.city,
    addressRegion: COMPANY_INFO.address.state,
    postalCode: COMPANY_INFO.address.zip,
    addressCountry: 'US',
  },
  description: 'A flight information platform helping travelers make informed booking decisions through transparent, accurate data.',
};

export default function HowWeHelpPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbData = generateBreadcrumbList([
    { name: 'Home', url: siteUrl },
    { name: 'How We Help', url: `${siteUrl}/how-we-help` },
  ]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'How We Help', href: '/how-we-help' },
        ]}
      />

      <JsonLd data={breadcrumbData} />
      <JsonLd data={organizationSchema} />

      <Typography variant="h1" gutterBottom sx={{ textAlign: 'left', mb: 2, fontSize: { xs: '2rem', sm: '2.5rem' } }}>
        How We Help You Travel Smarter
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
        Everything you need to know about using {COMPANY_INFO.name} to plan better trips
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Paper sx={{ p: { xs: 3, sm: 4 }, background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left', color: 'primary.main' }}>
            Comprehensive Flight Intelligence
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            We pull together flight schedules, route frequencies, airline operations, and airport data from 
            multiple verified sources. Our database is constantly updated to reflect real-world flight operations, 
            so you're always working with current information.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            Every route shows you how many flights operate daily, which airlines fly the route, typical flight 
            durations, and aircraft types. When data is estimated or historical, we clearly mark it—no surprises.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            Route Planning Made Simple
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Our route pages (like <Link href="/flights/del-bom" style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}>Delhi to Mumbai</Link>) 
            are your one-stop shop for understanding any flight route. See which airlines operate the route, 
            how frequently flights run, peak travel times, and what to expect on board.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Use these pages to:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
              Compare airlines operating the same route
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
              Understand flight frequency and availability patterns
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
              Learn about aircraft types and in-flight experience
            </Typography>
            <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
              Discover destination insights and local attractions
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, fontStyle: 'italic' }}>
            Remember: Always verify current prices and availability directly with airlines or booking platforms 
            before making your final booking decision.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            Airport & Airline Deep Dives
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ fontSize: '1.25rem', mb: 1.5, fontWeight: 600, color: 'primary.main' }}>
              Airport Intelligence
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
              Every airport page gives you the full picture: terminal layouts, peak departure times, connection 
              friendliness, popular destinations, and practical tips. Whether you're planning a layover or 
              navigating a new airport, we've got the details you need.
            </Typography>
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontSize: '1.25rem', mb: 1.5, fontWeight: 600, color: 'primary.main' }}>
              Airline Profiles
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
              Get to know airlines before you fly. Our airline pages show route networks, fleet information, 
              baggage policies, and operating regions. Understand an airline's strengths, coverage areas, 
              and what to expect before you book.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, fontStyle: 'italic' }}>
              Policy information is sourced from official airline sources and may vary by route or fare class. 
              Always confirm current policies directly with the airline.
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            Expert Travel Insights
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Our blog features articles written by verified travel experts who know the industry inside and out. 
            From booking strategies and route analysis to airport navigation tips and travel planning advice, 
            our content helps you make smarter decisions.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            These insights complement our data pages by adding context, explaining trends, and providing 
            practical guidance you can't get from raw numbers alone.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            What We're Not
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            It's important to understand our role: we're an information platform, not a booking service. 
            We don't sell tickets, we can't guarantee prices or availability, and we don't offer real-time 
            booking capabilities.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            Think of us as your research partner. We give you the data and insights to make informed choices. 
            When you're ready to book, head to airlines or authorized booking platforms for current prices 
            and availability.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

