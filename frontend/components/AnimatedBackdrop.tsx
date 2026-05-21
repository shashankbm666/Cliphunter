"use client";

import { motion } from "framer-motion";

const frames = [
  "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "https://i.ytimg.com/vi/ysz5S6PUM-U/hqdefault.jpg",
  "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
  "https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg",
  "https://i.ytimg.com/vi/LXb3EKWsInQ/hqdefault.jpg",
  "https://i.ytimg.com/vi/tgbNymZ7vqY/hqdefault.jpg"
];

export function AnimatedBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 grid w-[150vw] max-w-[1800px] -translate-x-1/2 -translate-y-1/2 grid-cols-3 gap-4 opacity-35 blur-[1px] sm:grid-cols-6"
        animate={{ x: [0, -36, 0], y: [0, 22, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        {frames.map((frame, index) => (
          <motion.div
            key={frame}
            className="aspect-video overflow-hidden rounded bg-white/5 shadow-2xl"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: index % 2 ? 1.04 : 0.98 }}
            transition={{ delay: index * 0.08, duration: 0.8 }}
          >
            <img
              alt=""
              className="h-full w-full object-cover saturate-75"
              src={frame}
            />
          </motion.div>
        ))}
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,11,0.48),#07080b_78%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(7,8,11,0.72)_58%,#07080b_100%)]" />
    </div>
  );
}
