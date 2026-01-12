import { Metadata } from 'next';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { generateMetadata as genMeta, generateBreadcrumbList } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import EmailIcon from '@mui/icons-material/Email';
import { COMPANY_INFO, getSiteUrl } from '@/lib/company';

export const metadata: Metadata = genMeta({
  title: `Report Corrections - ${COMPANY_INFO.name}`,
  description: `How to report errors, request corrections, and provide feedback on ${COMPANY_INFO.name} flight and travel information.`,
  canonical: '/corrections',
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

export default function CorrectionsPage() {
  const contactEmail = COMPANY_INFO.email;
  const siteUrl = getSiteUrl();
  const breadcrumbData = generateBreadcrumbList([
    { name: 'Home', url: siteUrl },
    { name: 'Corrections', url: `${siteUrl}/corrections` },
  ]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Corrections', href: '/corrections' },
        ]}
      />

      <JsonLd data={breadcrumbData} />
      <JsonLd data={organizationSchema} />

      <Typography variant="h1" gutterBottom sx={{ textAlign: 'left', mb: 2, fontSize: { xs: '2rem', sm: '2.5rem' } }}>
        Report Errors & Share Feedback
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
        Help us keep {COMPANY_INFO.name} accurate and useful for everyone
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Paper sx={{ p: { xs: 3, sm: 4 }, background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left', color: 'error.main' }}>
            Found an Error? Tell Us
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Accuracy is everything to us. If you spot incorrect flight schedules, wrong route information, 
            outdated airport data, or any other factual errors, we want to fix them immediately.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontWeight: 600 }}>
            To help us fix it quickly, please include:
          </Typography>
          <Box component="ul" sx={{ pl: 0, m: 0, mb: 3, listStyle: 'none' }}>
            <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mt: 1.5, flexShrink: 0 }} />
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                <strong>The page URL</strong> where you found the error
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mt: 1.5, flexShrink: 0 }} />
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                <strong>What's wrong</strong> - the specific incorrect information
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mt: 1.5, flexShrink: 0 }} />
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                <strong>The correct information</strong> - what it should say (include a source if you have one)
              </Typography>
            </Box>
            <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mt: 1.5, flexShrink: 0 }} />
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                <strong>Your contact info</strong> (optional) - so we can follow up if needed
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<EmailIcon />}
            href={`mailto:${contactEmail}?subject=Correction Request for ${COMPANY_INFO.name}`}
            sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Report an Error
          </Button>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            Our Correction Process
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Every correction request gets reviewed within 5 business days. If we can verify the error, 
            we fix it immediately. No bureaucracy, no delays—just quick, accurate corrections.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            For flight schedule errors, we cross-check against current airline operations data. For airline 
            policy information, we verify with official sources. We don't just take your word for it—we 
            verify everything before making changes.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            Significant corrections to published articles are marked with revision dates so you know when 
            something changed. Minor typos get fixed quietly—no need to make a big deal about spelling errors.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            How We Keep Content Current
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Flight data pages update automatically as new information flows in from our data sources. 
            These updates happen behind the scenes regularly—no correction request needed. The data 
            refreshes itself.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Blog articles clearly show when they were published and when they were last updated. Major 
            revisions are called out in the article itself, so you know what changed and why.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            Every page on our site includes a "Last updated" timestamp, so you always know how fresh 
            the information is. No guessing, no wondering—just clear transparency.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            We Want Your Feedback
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Found a way we could improve? Have an idea for a new feature? Think our data presentation 
            could be clearer? We're all ears. Your feedback shapes how we build and improve {COMPANY_INFO.name}.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            While we can't respond to every message individually, we read everything and incorporate 
            suggestions that align with our mission. Your voice matters, and we're listening.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h3" sx={{ fontSize: '1.25rem', mb: 2, fontWeight: 600 }}>
            Ready to Help Us Improve?
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, opacity: 0.95 }}>
            <strong>Email us:</strong> <a href={`mailto:${contactEmail}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{contactEmail}</a>
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.8, opacity: 0.9 }}>
            We typically respond to correction requests within 5 business days. For general feedback, 
            response times may vary, but we review everything.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

