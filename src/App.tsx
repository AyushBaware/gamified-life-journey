import { Suspense, lazy, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import StartScreen from "./screens/StartScreen";
import { useStore } from "./store/store";
import { sfx } from "./audio/sfx";

const GameScreen = lazy(() => import("./screens/GameScreen"));
const FinaleScreen = lazy(() => import("./screens/FinaleScreen"));

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#0B0F19" }}>
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
        <span className="h-2 w-2 animate-ping rounded-full" style={{ background: "#FFB86B" }} />
        Loading level
      </div>
    </div>
  );
}

export default function App() {
  const screen = useStore((s) => s.screen);
  const setIsTouch = useStore((s) => s.setIsTouch);
  const muted = useStore((s) => s.muted);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsTouch(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [setIsTouch]);

  useEffect(() => {
    sfx.setMuted(muted);
  }, [muted]);

  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<Loader />}>
        {screen === "start" && <StartScreen />}
        {screen === "game" && <GameScreen />}
        {screen === "finale" && <FinaleScreen />}
      </Suspense>
    </MotionConfig>
  );
}
