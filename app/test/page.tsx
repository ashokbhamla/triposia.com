import { Container, Typography, Box } from '@mui/material';
import { COMPANY_INFO } from '@/lib/company';

export const dynamic = 'force-dynamic';

export default function TestPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" gutterBottom>
        Test Page
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        If you can see this page, the deployment is working!
      </Typography>
      <Box>
        <Typography variant="body2" color="text.secondary">
          Site: {COMPANY_INFO.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          URL: {process.env.NEXT_PUBLIC_SITE_URL || 'Not set'}
        </Typography>
      </Box>
    </Container>
  );
}

