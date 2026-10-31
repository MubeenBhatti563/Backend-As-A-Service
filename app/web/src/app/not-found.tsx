'use client';

import { Box, Typography, Button } from '@mui/material';
import { IconRocket, IconArrowLeft, IconHome } from '@tabler/icons-react';
import Link from 'next/link';

export default function NotFound() {
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
      {/* ── Background glow effects ── */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0.04) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-30%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Floating astronaut avatar ── */}
      <Box
        sx={{
          position: 'relative',
          mb: 8,
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '25%': { transform: 'translateY(-12px) rotate(2deg)' },
            '50%': { transform: 'translateY(-6px) rotate(-1deg)' },
            '75%': { transform: 'translateY(-14px) rotate(1deg)' },
          },
          animation: 'float 6s ease-in-out infinite',
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        }}
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'background.elevated',
            border: '2px solid',
            borderColor: 'border.default',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 0 60px rgba(37,99,235,0.15), 0 0 120px rgba(37,99,235,0.05)',
          }}
        >
          <IconRocket size={44} color="#2563EB" style={{ transform: 'rotate(45deg)' }} />
        </Box>

        {/* Orbit ring */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 160,
            height: 160,
            borderRadius: '50%',
            border: '1px dashed',
            borderColor: 'border.default',
            transform: 'translate(-50%, -50%)',
            opacity: 0.4,
          }}
        />
      </Box>

      {/* ── 404 number ── */}
      <Typography
        sx={{
          fontFamily: 'var(--font-outfit), Outfit, sans-serif',
          fontSize: { xs: '7rem', sm: '9rem', md: '12rem' },
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-4px',
          background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 50%, #2563EB 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          userSelect: 'none',
          mb: 4,
        }}
      >
        404
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
        Lost in the void
      </Typography>

      {/* ── Subtitle ── */}
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          textAlign: 'center',
          maxWidth: 460,
          lineHeight: 1.7,
          fontSize: '1rem',
          mb: 10,
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist, was moved, or got
        swallowed by a black hole. Let&apos;s get you back on track.
      </Typography>

      {/* ── Actions ── */}
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          component={Link}
          href="/"
          variant="contained"
          startIcon={<IconHome size={18} />}
          sx={{
            px: 8,
            py: 3,
            fontSize: '0.9rem',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Back to Home
        </Button>

        <Button
          onClick={() => history.back()}
          variant="outlined"
          startIcon={<IconArrowLeft size={18} />}
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
              borderColor: 'primary.main',
              color: 'text.primary',
              bgcolor: 'background.elevated',
            },
          }}
        >
          Go Back
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
          HTTP 404 · NOT FOUND
        </Typography>
        <Box sx={{ width: 40, height: '1px', bgcolor: 'border.default' }} />
      </Box>
    </Box>
  );
}
