// src/app/layout.jsx
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme'; 
import { Toaster } from 'react-hot-toast';
import "@/app/globals.css"

export const metadata = {
  title: "Vendhub Inventory Management",
  description: "Inventory Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
          <ThemeProvider theme={theme}>
            {children}
          </ThemeProvider>
          <Toaster />
      </body>
    </html>
  );
}