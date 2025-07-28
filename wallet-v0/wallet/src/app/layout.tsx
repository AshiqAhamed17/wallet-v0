'use client'
import SafeConnectButton from '@/components/SafeConnectButton'
import {
  AppBar,
  Box,
  Button,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import Link from 'next/link'
import type { ReactNode } from 'react'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
    },
    border: {},
    logo: {},
    backdrop: {},
    static: {},
  },
  typography: {
    fontFamily: 'DMSans, Arial, sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
})

export default function RootLayout({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="static" color="primary" enableColorOnDark>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Safe Wallet
              </Typography>
              <Button color="inherit" component={Link} href="/import" aria-label="Import Safe" sx={{ mr: 2 }}>
                Import Safe
              </Button>
              <SafeConnectButton />
            </Toolbar>
          </AppBar>
          <Box component="main" sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {children}
          </Box>
        </ThemeProvider>
      </body>
    </html>
  )
}
