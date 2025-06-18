// src/app/dashboard/page.jsx
import { createClient } from "@/lib/supabase/server"; // Use the helper
import { redirect } from "next/navigation";
import Link from "next/link";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {
  Upload,
  LocationOn,
  AccountCircle,
  LogoutRounded,
  Dashboard as DashboardIcon,
  Store
} from "@mui/icons-material";

export default async function DashboardPage() {
  const supabase = await  createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --- THIS IS THE FIX ---
  // Call the new database function to get a unique list of site codes
  const { data: locations, error: locationsError } = await supabase.rpc(
    "get_unique_location_site_codes"
  );

  const signOut = async () => {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    // After signing out, redirect to the login page
    return redirect("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f6f7f9 0%, #e3eeff 100%)"
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          background: "linear-gradient(90deg, #2c3e50 0%, #3498db 100%)",
          px: 4,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <DashboardIcon sx={{ color: "#fff", fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#fff" }}>
            Vending Dashboard
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={3}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountCircle sx={{ color: "#fff" }} />
            <Typography variant="body1" sx={{ color: "#fff" }}>
              {user.email}
            </Typography>
          </Box>
          <form action={signOut}>
            <Button
              variant="contained"
              color="error"
              type="submit"
              startIcon={<LogoutRounded />}
              sx={{
                background: "linear-gradient(45deg, #ff416c 0%, #ff4b2b 100%)",
                "&:hover": {
                  background: "linear-gradient(45deg, #ff4b2b 0%, #ff416c 100%)"
                }
              }}
            >
              Logout
            </Button>
          </form>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 4, py: 5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Store sx={{ color: "#2c3e50", fontSize: 40 }} />
            <Typography
              variant="h4"
              fontWeight={600}
              sx={{
                background: "linear-gradient(45deg, #2c3e50 0%, #3498db 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Vending Machine Locations
            </Typography>
          </Box>
          <Link href="/dashboard/upload" passHref>
            <Button
              variant="contained"
              startIcon={<Upload />}
              sx={{
                background: "linear-gradient(45deg, #2ecc71 0%, #27ae60 100%)",
                "&:hover": {
                  background: "linear-gradient(45deg, #27ae60 0%, #2ecc71 100%)"
                }
              }}
            >
              Upload Sales Report
            </Button>
          </Link>
        </Box>

        {locationsError && (
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#ef4444",
                color: "#fff"
              },
              duration: 3000
            }}
          >
            {toast.error(`Error fetching locations: ${locationsError.message}`)}
          </Toaster>
        )}

        {/* --- LOCATIONS LIST UPDATED --- */}
        {!locationsError && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 3
            }}
          >
            {locations && locations.length > 0 ? (
              locations.map((location) => (
                <Link
                  key={location.site_code}
                  href={`/dashboard/locations/${location.site_code}`}
                  passHref
                  style={{ textDecoration: "none" }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
                      }
                    }}
                  >
                    <CardActionArea sx={{ height: "100%", p: 2 }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2
                          }}
                        >
                          <LocationOn sx={{ color: "#3498db" }} />
                          <Typography variant="h6" sx={{ color: "#2c3e50" }}>
                            {/* Display the site_code as the primary identifier */}
                            Location: {location.site_code}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Link>
              ))
            ) : (
              <Typography sx={{ color: "#7f8c8d", textAlign: "center" }}>
                No locations found in sales records.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
