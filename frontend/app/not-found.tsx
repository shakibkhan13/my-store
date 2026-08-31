"use client";

import { cn } from "@/lib/utils";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { FileQuestion, MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <Container maxWidth="md">
      <Box className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            className="p-8 sm:p-12 rounded-xl bg-white dark:bg-card"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 mx-auto text-primary w-24 h-24 flex items-center justify-center rounded-full bg-primary/10"
            >
              <FileQuestion size={48} className="text-primary" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Typography
                variant="h1"
                component="h1"
                className="text-5xl sm:text-6xl font-bold mb-4 text-primary"
              >
                404
              </Typography>

              <Typography
                variant="h4"
                component="h2"
                className="text-2xl sm:text-3xl font-medium mb-4 text-foreground"
              >
                Page Not Found
              </Typography>

              <Typography
                variant="body1"
                className="text-muted-foreground mb-8 max-w-md mx-auto"
              >
                The page you are looking for might have been removed, had its
                name changed, or is temporarily unavailable.
              </Typography>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push("/")}
                  className={cn(
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    "px-6 py-3 rounded-lg shadow-md flex items-center gap-2 mx-auto"
                  )}
                >
                  <MoveLeft size={20} />
                  Back to Home
                </Button>
              </motion.div>
            </motion.div>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
}
