import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
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
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: locations, error: locationsError } = await supabase
    .from("locations")
    .select("*");

  const signOut = async () => {
    "use server";
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options });
          }
        }
      }
    );

    await supabase.auth.signOut();
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

        {/* Error Display */}
        {locationsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error fetching locations: {locationsError.message}
          </Alert>
        )}

        {/* Locations List */}
        {!locationsError && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 3
            }}
          >
            {locations && locations.filter((l) => l.id).length > 0 ? (
              locations
                .filter((location) => location.id)
                .map((location) => (
                  <Link
                    key={location.id}
                    href={`/dashboard/locations/${location.id}`}
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
                        border: "1px solid transparent",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                          borderColor: "#3498db",
                        }
                      }}
                    >
                      <CardActionArea sx={{ height: "100%", p: 1 }}>
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
                              {location.display_name || "Unnamed Location"}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              color: "#34495e",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1
                            }}
                          >
                            <Store sx={{ fontSize: 20 }} />
                            Site Code: {location.site_code}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#7f8c8d",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1
                            }}
                          >
                            <LocationOn sx={{ fontSize: 20 }} />
                            {location.address || "Not specified"}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Link>
                ))
            ) : (
              <Typography sx={{ color: "#7f8c8d", textAlign: "center" }}>
                No locations found.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
