import { Metadata } from 'next';
import { Container, Typography, Box, Paper } from '@mui/material';
import { generateMetadata as genMeta, generateBreadcrumbList } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from 'next/link';
import { COMPANY_INFO, getSiteUrl } from '@/lib/company';

export const metadata: Metadata = genMeta({
  title: `Editorial Policy - ${COMPANY_INFO.name}`,
  description: 'Our editorial standards, author verification, review process, and commitment to factual accuracy in travel content.',
  canonical: '/editorial-policy',
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

export default function EditorialPolicyPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbData = generateBreadcrumbList([
    { name: 'Home', url: siteUrl },
    { name: 'Editorial Policy', url: `${siteUrl}/editorial-policy` },
  ]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Editorial Policy', href: '/editorial-policy' },
        ]}
      />

      <JsonLd data={breadcrumbData} />
      <JsonLd data={organizationSchema} />

      <Typography variant="h1" gutterBottom sx={{ textAlign: 'left', mb: 2, fontSize: { xs: '2rem', sm: '2.5rem' } }}>
        Our Editorial Standards
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
        How we ensure every piece of content meets our high standards for accuracy and authenticity
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Paper sx={{ p: { xs: 3, sm: 4 }, background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left', color: 'primary.main' }}>
            Real Authors, Real Expertise
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Every article on {COMPANY_INFO.name} is written by a verified human expert with genuine industry 
            experience. No AI-generated content. No ghostwriters. No mass-produced filler. Just real people 
            sharing real knowledge.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            Every author profile shows their credentials, years of experience, areas of specialization, and 
            professional background. If someone writes about airline operations, they've worked in airline 
            operations. If they write about airport logistics, they know airports. Simple as that.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            Rigorous Verification Process
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Before any author can publish, we verify their professional background through LinkedIn, work 
            history, industry credentials, or equivalent professional verification. We check that their 
            claimed expertise matches their actual experience.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            Anonymous authors, generic profiles, or unverifiable credentials don't make it through our 
            vetting process. If you can't prove you know what you're talking about, you can't write about it here.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            Continuous Review & Updates
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Every article goes through editorial review before publication. We fact-check claims, verify data 
            sources, ensure clarity, and confirm the content aligns with our standards. Nothing gets published 
            without passing this review.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            But our work doesn't stop at publication. We regularly review content and update it when flight 
            data changes, airline policies evolve, or travel information becomes outdated. Major updates 
            are clearly marked with revision dates so you know when something changed.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            Articles connected to specific routes, airports, or airlines get special attention whenever 
            the underlying data changes significantly. If the facts change, our content changes too.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            Fact-Checked, Always
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            Flight schedules, route data, airport information, and airline policies come from official 
            sources: airline operations data, airport authorities, and verified travel data providers. 
            When we use estimated or historical data, we tell you upfront.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            We make a clear distinction between facts and opinions. Data-driven insights are labeled as 
            such. Editorial recommendations are presented as recommendations, not facts. You'll always 
            know what you're reading.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            Mistakes happen. When they do, we fix them immediately and transparently. Found an error? 
            <Link href="/corrections" style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600, marginLeft: '4px' }}>Let us know</Link> and we'll correct it.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            Quality Over Quantity
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            You won't find auto-generated articles, template-based content, or mass-produced posts here. 
            We don't publish just to increase our page count. Every article must deliver unique value and 
            genuine insight that helps you make better travel decisions.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            We publish less frequently than many sites, and that's intentional. We'd rather publish one 
            excellent, thoroughly researched article than ten mediocre ones. Depth beats volume. Accuracy 
            beats speed. Quality beats quantity.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 2, textAlign: 'left' }}>
            Honest Linking Practices
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
            When our articles link to route, airport, or airline pages, it's because those links genuinely 
            help you understand the topic better. Links are there for your benefit, not to manipulate search 
            rankings or inflate metrics.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            You won't see excessive cross-linking, keyword stuffing, or artificial link schemes. Every link 
            must be contextually relevant and actually useful. If it doesn't help you, it doesn't belong.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

