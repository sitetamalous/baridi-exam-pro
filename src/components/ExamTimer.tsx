
import React, { useEffect, useRef } from "react";

interface ExamTimerProps {
  secondsLeft: number;
  onExpire: () => void;
}

const format = (secs: number) => {
  const h = Math.floor(secs / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return h !== "00" ? `${h}:${m}:${s}` : `${m}:${s}`;
};

const ExamTimer: React.FC<ExamTimerProps> = ({ secondsLeft, onExpire }) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [time, setTime] = React.useState(secondsLeft);

  useEffect(() => {
    setTime(secondsLeft);
  }, [secondsLeft]);

  useEffect(() => {
    if (time === 0) {
      onExpire();
      return;
    }
    intervalRef.current = setInterval(() => setTime((t) => t - 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [time, onExpire]);

  return (
    <div className="font-bold text-lg text-algeria-green flex items-center justify-center gap-2">
      <span className="w-11 text-center">{format(time)}</span>
      <span className="text-xs text-gray-500">الوقت المتبقي</span>
    </div>
  );
};
export default ExamTimer;
