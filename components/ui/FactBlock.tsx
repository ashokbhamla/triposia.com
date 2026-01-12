import { Grid, Paper, Typography, Box } from '@mui/material';

interface FactItem {
  label: string;
  value: string | number | React.ReactNode;
}

interface FactBlockProps {
  title: string;
  facts: FactItem[];
  columns?: 2 | 3 | 4;
}

export default function FactBlock({ title, facts, columns = 3 }: FactBlockProps) {
  const gridSize = columns === 2 ? 6 : columns === 3 ? 4 : 3;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ fontSize: '1.5rem', mb: 2, textAlign: 'left' }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {facts.map((fact, index) => (
          <Grid item xs={12} sm={6} md={gridSize} key={index}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {fact.label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {fact.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

