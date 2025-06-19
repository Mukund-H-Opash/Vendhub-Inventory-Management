import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Box, Card, CardActionArea, CardContent, Typography, Button, Alert } from "@mui/material";
import { Upload, LocationOn, Store } from "@mui/icons-material";
import Header from "@/components/dashboard/Header"; 

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: locations, error: locationsError } = await supabase.rpc(
    "get_unique_location_site_codes"
  );

  const signOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f6f7f9 0%, #e3eeff 100%)",
      }}
    >
      <Header user={user} signOut={signOut} />

      <Box sx={{ px: 4, py: 5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
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
                WebkitTextFillColor: "transparent",
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
                  background: "linear-gradient(45deg, #27ae60 0%, #2ecc71 100%)",
                },
              }}
            >
              Upload Sales Report
            </Button>
          </Link>
        </Box>
        {locationsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error fetching locations: {locationsError.message}
          </Alert>
        )}

        {!locationsError && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 3,
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
                      background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <CardActionArea sx={{ height: "100%", p: 2 }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <LocationOn sx={{ color: "#3498db" }} />
                          <Typography variant="h6" sx={{ color: "#2c3e50" }}>
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