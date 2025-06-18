import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import "@/app/globals.css"

export default function DashboardLayout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* A placeholder for a future sidebar */}
      {/* <Sidebar /> */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0, // Changed from { xs: 2, sm: 3 } to 0 to remove padding
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
