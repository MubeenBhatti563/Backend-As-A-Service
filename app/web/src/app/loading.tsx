'use client';

import { Box, Typography } from '@mui/material';
import { IconDatabase } from '@tabler/icons-react';

export default function Loading() {
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
      }}
    >
      {/* ── Subtle background glow ── */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.02) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Logo avatar with spinner ring ── */}
      <Box
        sx={{
          position: 'relative',
          mb: 10,
        }}
      >
        {/* Spinning orbit ring */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'primary.main',
            borderRightColor: 'rgba(37,99,235,0.3)',
            transform: 'translate(-50%, -50%)',
            '@keyframes spin': {
              '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
              '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
            },
            animation: 'spin 1.2s linear infinite',
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              borderColor: 'border.default',
              borderTopColor: 'primary.main',
            },
          }}
        />

        {/* Outer subtle ring */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 130,
            height: 130,
            borderRadius: '50%',
            border: '1px solid',
            borderColor: 'border.default',
            transform: 'translate(-50%, -50%)',
            opacity: 0.3,
          }}
        />

        {/* Center logo icon */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'background.elevated',
            border: '1px solid',
            borderColor: 'border.default',
            display: 'grid',
            placeItems: 'center',
            '@keyframes pulse-logo': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.6 },
            },
            animation: 'pulse-logo 2s ease-in-out infinite',
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >
          <IconDatabase size={28} color="#2563EB" />
        </Box>
      </Box>

      {/* ── Loading text ── */}
      <Typography
        sx={{
          fontFamily: 'var(--font-outfit), Outfit, sans-serif',
          fontWeight: 600,
          fontSize: '1.1rem',
          color: 'text.primary',
          mb: 2,
        }}
      >
        Loading
      </Typography>

      {/* ── Animated dots bar ── */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              '@keyframes bounce-dot': {
                '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                '40%': { opacity: 1, transform: 'scale(1.2)' },
              },
              animation: `bounce-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
                opacity: i === 1 ? 1 : 0.4,
              },
            }}
          />
        ))}
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
          DevStack
        </Typography>
        <Box sx={{ width: 40, height: '1px', bgcolor: 'border.default' }} />
      </Box>
    </Box>
  );
}
