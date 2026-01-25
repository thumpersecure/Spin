/**
 * MADROX Theme
 *
 * Dark, mysterious theme inspired by Jamie Madrox.
 * Deep purples, glowing greens, and shadowy blues.
 */

import { createTheme, MantineColorsTuple } from '@mantine/core';

// MADROX Purple - Primary color for duplication/identity
const madroxPurple: MantineColorsTuple = [
  '#f3e8ff',
  '#e2cffc',
  '#c49df7',
  '#a568f2',
  '#8c3aee',
  '#7b1feb',
  '#7410ea',
  '#6305d1',
  '#5800bc',
  '#4c00a5',
];

// Hivemind Green - For entity sync and connections
const hivemindGreen: MantineColorsTuple = [
  '#e6fff0',
  '#d0f9e1',
  '#a3f2c3',
  '#72eba2',
  '#4ae586',
  '#30e172',
  '#1cdf66',
  '#00c654',
  '#00b049',
  '#00993a',
];

// OSINT Blue - For intelligence and research
const osintBlue: MantineColorsTuple = [
  '#e5f4ff',
  '#cde4ff',
  '#9bc7ff',
  '#64a8ff',
  '#388dff',
  '#1a7dff',
  '#0074ff',
  '#0063e5',
  '#0058cd',
  '#004bb5',
];

// Alert Red - For warnings and high-risk items
const alertRed: MantineColorsTuple = [
  '#ffe8e8',
  '#ffcfcf',
  '#ff9c9c',
  '#ff6464',
  '#ff3838',
  '#ff1c1c',
  '#ff0a0a',
  '#e40000',
  '#cb0000',
  '#b00000',
];

export const madroxTheme = createTheme({
  primaryColor: 'madroxPurple',
  primaryShade: 6,

  colors: {
    madroxPurple,
    hivemindGreen,
    osintBlue,
    alertRed,
    // Override dark colors for our theme
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#1A1B1E', // Main background
      '#141517',
      '#101113',
      '#0A0A0B', // Deepest
    ],
  },

  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace:
    '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace',

  headings: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
  },

  defaultRadius: 'md',

  components: {
    Button: {
      defaultProps: {
        variant: 'filled',
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },

    Paper: {
      defaultProps: {
        shadow: 'sm',
      },
    },

    Modal: {
      defaultProps: {
        overlayProps: {
          backgroundOpacity: 0.7,
          blur: 3,
        },
      },
    },

    Tooltip: {
      defaultProps: {
        withArrow: true,
        arrowSize: 6,
      },
    },

    TextInput: {
      styles: {
        input: {
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-5)',
          '&:focus': {
            borderColor: 'var(--mantine-color-madroxPurple-6)',
          },
        },
      },
    },

    Select: {
      styles: {
        input: {
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-5)',
        },
      },
    },

    Card: {
      defaultProps: {
        padding: 'lg',
        radius: 'md',
      },
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-dark-7)',
        },
      },
    },

    Badge: {
      styles: {
        root: {
          textTransform: 'none',
        },
      },
    },

    Tabs: {
      styles: {
        tab: {
          fontWeight: 500,
          '&[data-active]': {
            borderColor: 'var(--mantine-color-madroxPurple-6)',
          },
        },
      },
    },
  },

  other: {
    // Custom MADROX-specific tokens
    glowPurple: '0 0 20px rgba(123, 31, 235, 0.4)',
    glowGreen: '0 0 20px rgba(28, 223, 102, 0.4)',
    glowBlue: '0 0 20px rgba(56, 141, 255, 0.4)',
  },
});

// CSS variables for custom styling
export const madroxCssVariables = `
  :root {
    --madrox-glow-purple: 0 0 20px rgba(123, 31, 235, 0.4);
    --madrox-glow-green: 0 0 20px rgba(28, 223, 102, 0.4);
    --madrox-glow-blue: 0 0 20px rgba(56, 141, 255, 0.4);
    --madrox-border-glow: 0 0 10px rgba(123, 31, 235, 0.2);
  }
`;
