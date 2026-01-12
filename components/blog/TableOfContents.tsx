'use client';

import { Box, Typography, List, ListItem, ListItemButton, Paper } from '@mui/material';
import { TocItem } from '@/lib/tableOfContents';
import { useEffect, useState } from 'react';

interface TableOfContentsProps {
  items: TocItem[];
  title?: string;
}

export default function TableOfContents({ items, title = 'Table of Contents' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (items.length === 0) return;

    const handleScroll = () => {
      const headingElements = items.map(item => {
        const element = document.getElementById(item.id);
        return element ? { id: item.id, element, top: element.getBoundingClientRect().top } : null;
      }).filter(Boolean) as Array<{ id: string; element: HTMLElement; top: number }>;

      // Find the heading that's currently in view
      const currentHeading = headingElements
        .filter(({ top }) => top <= 150) // Offset from top
        .sort((a, b) => b.top - a.top)[0]; // Get the last one that's passed

      if (currentHeading) {
        setActiveId(currentHeading.id);
      } else if (window.scrollY < 200) {
        // If at top, don't highlight anything
        setActiveId('');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  if (items.length === 0) return null;

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 4,
        position: 'sticky',
        top: 100,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
      }}
    >
      <Typography
        variant="h6"
        component="nav"
        id="table-of-contents"
        aria-label="Table of contents"
        sx={{
          fontWeight: 700,
          mb: 2,
          fontSize: '1.125rem',
          color: 'primary.main',
        }}
      >
        {title}
      </Typography>
      <List component="nav" aria-label="Table of contents" sx={{ p: 0 }}>
        {items.map((item) => (
          <ListItem
            key={item.id}
            disablePadding
            sx={{
              mb: 0.5,
              pl: (item.level - 2) * 2, // Indent based on level (h2 = 0, h3 = 2, h4 = 4, etc.)
            }}
          >
            <ListItemButton
              onClick={() => handleClick(item.id)}
              selected={activeId === item.id}
              sx={{
                py: 0.75,
                px: 1.5,
                borderRadius: 1,
                fontSize: item.level === 2 ? '0.9375rem' : '0.875rem',
                fontWeight: item.level === 2 ? 600 : 500,
                color: activeId === item.id ? 'primary.main' : 'text.primary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                },
              }}
            >
              <Typography
                variant="body2"
                component="span"
                sx={{
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  color: 'inherit',
                }}
              >
                {item.text}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

