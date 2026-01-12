import { Metadata } from 'next';
import { Container, Typography, Box, Paper } from '@mui/material';
import { generateMetadata as genMeta, generateBreadcrumbList } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { COMPANY_INFO, getSiteUrl } from '@/lib/company';

export const metadata: Metadata = genMeta({
  title: `Our Manifesto - ${COMPANY_INFO.name}`,
  description: 'Our commitment to helping travelers make informed flight decisions through transparency, accuracy, and user-first principles.',
  canonical: '/manifesto',
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

export default function ManifestoPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbData = generateBreadcrumbList([
    { name: 'Home', url: siteUrl },
    { name: 'Manifesto', url: `${siteUrl}/manifesto` },
  ]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Manifesto', href: '/manifesto' },
        ]}
      />

      <JsonLd data={breadcrumbData} />
      <JsonLd data={organizationSchema} />

      <Typography variant="h1" gutterBottom sx={{ textAlign: 'left', mb: 2, fontSize: { xs: '2rem', sm: '2.5rem' } }}>
        Our Manifesto
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
        The principles that guide everything we do at {COMPANY_INFO.name}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Paper sx={{ p: { xs: 3, sm: 4 }, background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left', color: 'primary.main' }}>
            Why We Exist
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Travel planning shouldn't be a guessing game. At {COMPANY_INFO.name}, we believe every traveler deserves 
            access to clear, accurate flight information—without the sales pitch, hidden agendas, or confusing fine print.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            We're not a booking site. We don't sell tickets. We don't take commissions. Our only job is to give you 
            the facts you need to make smart travel decisions.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 3, textAlign: 'left' }}>
            Our Core Values
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h3" sx={{ fontSize: '1.25rem', mb: 1, fontWeight: 600, color: 'primary.main' }}>
                Truth Over Speed
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                We'd rather be right than be first. Every piece of data is verified before it reaches you. 
                If we're not certain, we'll tell you.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontSize: '1.25rem', mb: 1, fontWeight: 600, color: 'primary.main' }}>
                Your Needs, Not Ours
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                We design features based on what helps you plan better trips, not what drives clicks or revenue. 
                Your success is our success.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontSize: '1.25rem', mb: 1, fontWeight: 600, color: 'primary.main' }}>
                Complete Transparency
            </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                You'll always know where our information comes from. No hidden sources, no mysterious algorithms, 
                no black boxes.
            </Typography>
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontSize: '1.25rem', mb: 1, fontWeight: 600, color: 'primary.main' }}>
                Actionable Intelligence
            </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Every statistic, every route detail, every airport insight is designed to help you make a 
                better decision. No fluff, just facts.
            </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 3, textAlign: 'left' }}>
            What You'll Never See Here
          </Typography>
          <Box component="ul" sx={{ pl: 0, m: 0, listStyle: 'none' }}>
            <Box component="li" sx={{ mb: 2.5, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', mt: 1.5, flexShrink: 0 }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>Hidden Data Sources</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  We'll never hide where our information comes from or make claims we can't back up.
            </Typography>
              </Box>
            </Box>
            <Box component="li" sx={{ mb: 2.5, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', mt: 1.5, flexShrink: 0 }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>Pay-to-Play Rankings</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Airlines and airports can't buy better placement. What you see is what the data shows.
            </Typography>
              </Box>
            </Box>
            <Box component="li" sx={{ mb: 2.5, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', mt: 1.5, flexShrink: 0 }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>Deceptive Practices</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  No clickbait, no fake urgency, no misleading information designed to manipulate your choices.
            </Typography>
              </Box>
            </Box>
            <Box component="li" sx={{ mb: 2.5, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', mt: 1.5, flexShrink: 0 }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>Low-Quality Content</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  We don't publish auto-generated pages or thin content just to fill space. Every page serves a purpose.
            </Typography>
              </Box>
            </Box>
            <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', mt: 1.5, flexShrink: 0 }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>Data Misuse</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Your privacy matters. We don't sell your data, track you across the web, or use your information 
                  for anything beyond improving our service.
            </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            Built for Smart Travelers
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            {COMPANY_INFO.name} is for travelers who do their homework. Whether you're comparing routes for a 
            business trip, planning a family vacation, or exploring last-minute options, we give you the 
            comprehensive data you need—without the marketing noise.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            If you value accuracy over hype, facts over fluff, and transparency over tricks, you're in the right place.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

