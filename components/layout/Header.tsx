'use client';

import { AppBar, Toolbar, Typography, Container, Box, useMediaQuery, useTheme } from '@mui/material';
import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/company';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 0 } }}>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            component={Link}
            href="/"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              mr: { xs: 2, sm: 4 },
              fontSize: { xs: '1rem', sm: '1.25rem' },
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 0.8 },
            }}
          >
            {COMPANY_INFO.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 3 }, flexGrow: 1, flexWrap: 'wrap' }}>
            <Typography
              component={Link}
              href="/airports"
              sx={{ 
                color: 'text.primary', 
                textDecoration: 'none', 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 500,
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main' } 
              }}
            >
              Airports
            </Typography>
            <Typography
              component={Link}
              href="/flights"
              sx={{ 
                color: 'text.primary', 
                textDecoration: 'none', 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 500,
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main' } 
              }}
            >
              Flights
            </Typography>
            <Typography
              component={Link}
              href="/airlines"
              sx={{ 
                color: 'text.primary', 
                textDecoration: 'none', 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 500,
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main' } 
              }}
            >
              Airlines
            </Typography>
            <Typography
              component={Link}
              href="/blog"
              sx={{ 
                color: 'text.primary', 
                textDecoration: 'none', 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 500,
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main' } 
              }}
            >
              Blog
            </Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

