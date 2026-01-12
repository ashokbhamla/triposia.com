import { Box, Typography, Paper } from '@mui/material';

interface AnswerSummaryProps {
  children: React.ReactNode;
}

export default function AnswerSummary({ children }: AnswerSummaryProps) {
  return (
    <Paper
      sx={{
        p: 3,
        mb: 4,
        bgcolor: 'action.hover',
        borderLeft: 4,
        borderColor: 'primary.main',
        borderRadius: 2,
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontSize: '1.15rem',
          lineHeight: 1.8,
          fontWeight: 400,
          color: 'text.primary',
        }}
      >
        {children}
      </Typography>
    </Paper>
  );
}

