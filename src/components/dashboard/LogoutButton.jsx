import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@mui/material";
import { LogoutRounded } from "@mui/icons-material";

export default function LogoutButton() {
  const signOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return (
    <form action={signOut}>
      <Button
        variant="contained"
        color="error"
        type="submit"
        startIcon={<LogoutRounded />}
        sx={{
          background: "linear-gradient(45deg, #ff416c 0%, #ff4b2b 100%)",
          "&:hover": {
            background: "linear-gradient(45deg, #ff4b2b 0%, #ff416c 100%)",
          },
        }}
      >
        Logout
      </Button>
    </form>
  );
}