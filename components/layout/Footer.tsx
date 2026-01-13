'use client';

import { Box, Container, Typography, Link as MuiLink, IconButton } from '@mui/material';
import { Phone, Facebook, Instagram, YouTube } from '@mui/icons-material';
import { COMPANY_INFO } from '@/lib/company';
import { keyframes } from '@mui/system';

// Animation keyframes
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const ring = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
`;

export default function Footer() {
  return (
    <>
      {/* Sticky Call-to-Action Banner */}
      <Box
        component="a"
        href="tel:+1-877-922-5372"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: '#e8f5e9', // Light green background
          color: '#1b5e20', // Dark green text
          py: { xs: 2, sm: 2.5, md: 3 }, // More padding
          px: { xs: 2, sm: 3, md: 4 }, // More padding
          zIndex: 1000,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 1, sm: 1.5, md: 2 },
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          animation: `${pulse} 2s ease-in-out infinite`,
          '&:hover': {
            bgcolor: '#c8e6c9', // Slightly darker green on hover
            transform: 'translateY(-2px)',
            boxShadow: '0 -6px 16px rgba(0,0,0,0.2)',
            animation: 'none',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        }}
      >
        {/* Animated phone icon */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Ring animation effect */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid #4caf50',
              animation: `${ring} 2s ease-out infinite`,
            }}
          />
          <Phone 
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              color: '#2e7d32', // Dark green icon
              animation: `${bounce} 2s ease-in-out infinite`,
              position: 'relative',
              zIndex: 1,
            }} 
          />
        </Box>
        
        {/* Text content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' } }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
              lineHeight: 1.2,
              color: '#388e3c', // Medium green for "Call" text
              display: { xs: 'none', sm: 'block' },
              mb: 0.25,
            }}
          >
            Call Now
          </Typography>
          <Typography 
            component="span"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              lineHeight: 1.2,
              color: '#1b5e20', // Dark green for phone number
              whiteSpace: 'nowrap',
              letterSpacing: '0.5px',
            }}
          >
            +1-877-922-5372
        </Typography>
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          py: { xs: 4, sm: 5 },
          mt: 'auto',
          pb: { xs: 8, sm: 9, md: 10 }, // Add padding bottom to account for sticky banner
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: { xs: 4, md: 3 } }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'primary.main', 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                }}
              >
                {COMPANY_INFO.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="left" sx={{ mb: 1 }}>
                © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.
              </Typography>
              <Typography variant="body2" color="text.secondary" align="left" sx={{ mb: 0.5 }}>
                {COMPANY_INFO.address.full}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="left">
                <MuiLink 
                  href={`mailto:${COMPANY_INFO.email}`} 
                  color="primary.main" 
                  underline="hover"
                  sx={{ 
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  {COMPANY_INFO.email}
                </MuiLink>
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.primary" sx={{ mb: 1.5, fontWeight: 600 }}>
                Directories
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
                <MuiLink 
                  href="/airports" 
                  color="text.secondary" 
                  underline="hover"
                  sx={{ 
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  Airports
                </MuiLink>
                <MuiLink 
                  href="/airlines" 
                  color="text.secondary" 
                  underline="hover"
                  sx={{ 
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  Airlines
                </MuiLink>
                <MuiLink 
                  href="/airlines/routes" 
                  color="text.secondary" 
                  underline="hover"
                  sx={{ 
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  Airline Routes
                </MuiLink>
                <MuiLink 
                  href="/flights" 
                  color="text.secondary" 
                  underline="hover"
                  sx={{ 
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  Flight Routes
                </MuiLink>
              </Box>
              <Typography variant="body2" color="text.primary" sx={{ mb: 1.5, fontWeight: 600 }}>
                About
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <MuiLink 
                  href="/manifesto" 
                  color="text.secondary" 
                  underline="hover"
                  sx={{ 
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  Manifesto
                </MuiLink>
                <MuiLink 
                  href="/how-we-help" 
                  color="text.secondary" 
                  underline="hover"
                  sx={{ 
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  How We Help
                </MuiLink>
                <MuiLink 
                  href="/editorial-policy" 
                  color="text.secondary" 
                  underline="hover"
                  sx={{ 
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  Editorial Policy
                </MuiLink>
                <MuiLink 
                  href="/corrections" 
                  color="text.secondary" 
                  underline="hover"
                  sx={{ 
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  Corrections
                </MuiLink>
                <MuiLink 
                  href="/team" 
                  color="text.secondary" 
                  underline="hover"
                  sx={{ 
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  Team
                </MuiLink>
              </Box>
            </Box>
            
            {/* Social Media Links */}
            <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '200px' } }}>
              <Typography variant="body2" color="text.primary" sx={{ mb: 1.5, fontWeight: 600 }}>
                Follow Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {COMPANY_INFO.social.facebook && (
                  <IconButton
                    component="a"
                    href={COMPANY_INFO.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: '#1877F2',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Facebook />
                  </IconButton>
                )}
                {COMPANY_INFO.social.instagram && (
                  <IconButton
                    component="a"
                    href={COMPANY_INFO.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: '#E4405F',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Instagram />
                  </IconButton>
                )}
                {COMPANY_INFO.social.youtube && (
                  <IconButton
                    component="a"
                    href={COMPANY_INFO.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: '#FF0000',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <YouTube />
                  </IconButton>
                )}
                {COMPANY_INFO.social.dailymotion && (
                  <IconButton
                    component="a"
                    href={COMPANY_INFO.social.dailymotion}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Dailymotion"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: '#0066DC',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <YouTube /> {/* Using YouTube icon as placeholder for Dailymotion */}
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}

