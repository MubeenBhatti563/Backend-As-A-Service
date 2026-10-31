'use client';

import { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { IconAlertTriangle, IconRefresh, IconHome } from '@tabler/icons-react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.input',
        position: 'relative',
        overflow: 'hidden',
        px: 5,
      }}
    >
      {/* ── Background glow ── */}
      <Box
        sx={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(239,68,68,0.10) 0%, rgba(239,68,68,0.03) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-25%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Warning avatar with pulse ── */}
      <Box
        sx={{
          position: 'relative',
          mb: 8,
        }}
      >
        {/* Pulsing ring */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: '1px solid',
            borderColor: 'error.main',
            transform: 'translate(-50%, -50%)',
            opacity: 0.15,
            '@keyframes pulse-ring': {
              '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.15 },
              '50%': { transform: 'translate(-50%, -50%) scale(1.15)', opacity: 0.05 },
              '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.15 },
            },
            animation: 'pulse-ring 3s ease-in-out infinite',
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        />

        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            bgcolor: 'background.elevated',
            border: '2px solid',
            borderColor: 'error.main',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 0 60px rgba(239,68,68,0.12), 0 0 120px rgba(239,68,68,0.04)',
          }}
        >
          <IconAlertTriangle size={42} color="#EF4444" />
        </Box>
      </Box>

      {/* ── Error code ── */}
      <Typography
        sx={{
          fontFamily: 'var(--font-outfit), Outfit, sans-serif',
          fontSize: { xs: '5rem', sm: '7rem', md: '9rem' },
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-3px',
          background: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 60%, #EF4444 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          userSelect: 'none',
          mb: 4,
        }}
      >
        500
      </Typography>

      {/* ── Title ── */}
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'var(--font-outfit), Outfit, sans-serif',
          fontWeight: 800,
          color: 'text.primary',
          textAlign: 'center',
          mb: 3,
        }}
      >
        Something went wrong
      </Typography>

      {/* ── Subtitle ── */}
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          textAlign: 'center',
          maxWidth: 480,
          lineHeight: 1.7,
          fontSize: '1rem',
          mb: 4,
        }}
      >
        An unexpected error occurred while rendering this page. Our team has
        been notified. You can try again or head back to safety.
      </Typography>

      {/* ── Error digest (dev help) ── */}
      {error.digest && (
        <Box
          sx={{
            mb: 8,
            px: 5,
            py: 2,
            borderRadius: 1.5,
            bgcolor: 'background.elevated',
            border: '1px solid',
            borderColor: 'border.default',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'var(--font-geist-mono), monospace',
              color: 'text.disabled',
              letterSpacing: '0.04em',
            }}
          >
            Digest: {error.digest}
          </Typography>
        </Box>
      )}

      {/* ── Actions ── */}
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', mt: error.digest ? 0 : 6 }}>
        <Button
          onClick={reset}
          variant="contained"
          color="error"
          startIcon={<IconRefresh size={18} />}
          sx={{
            px: 8,
            py: 3,
            fontSize: '0.9rem',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Try Again
        </Button>

        <Button
          component={Link}
          href="/"
          variant="outlined"
          startIcon={<IconHome size={18} />}
          sx={{
            px: 8,
            py: 3,
            fontSize: '0.9rem',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'border.strong',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'error.main',
              color: 'text.primary',
              bgcolor: 'background.elevated',
            },
          }}
        >
          Back to Home
        </Button>
      </Box>

      {/* ── Bottom decorative line ── */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Box sx={{ width: 40, height: '1px', bgcolor: 'border.default' }} />
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            fontFamily: 'var(--font-geist-mono), monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: '0.65rem',
          }}
        >
          HTTP 500 · INTERNAL ERROR
        </Typography>
        <Box sx={{ width: 40, height: '1px', bgcolor: 'border.default' }} />
      </Box>
    </Box>
  );
}
