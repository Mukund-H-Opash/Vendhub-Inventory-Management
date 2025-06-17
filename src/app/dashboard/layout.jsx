import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function DashboardLayout({ children }) {
  // This simple layout provides a consistent container for all dashboard pages.
  // For a full sidebar/header, we would create those as separate components.
  // For now, let's create a clean, contained main area.
  return (
    <Box sx={{ display: 'flex' }}>
      {/* A placeholder for a future sidebar */}
      {/* <Sidebar /> */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 }, // Responsive padding
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        {/* A placeholder for a future header */}
        {/* <Header /> */}
        {children}
      </Box>
    </Box>
  );
}
