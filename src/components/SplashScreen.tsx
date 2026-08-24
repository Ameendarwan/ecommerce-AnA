"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { BrandLoadingContent } from "@/components/BrandLoadingScreen";

const SPLASH_MIN_MS = 1200;

export function SplashScreen() {
  const { loading: authLoading } = useAuth();
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimeDone && !authLoading) {
      setVisible(false);
    }
  }, [minTimeDone, authLoading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[#faf8f5]"
          aria-hidden={!visible}
        >
          <BrandLoadingContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
