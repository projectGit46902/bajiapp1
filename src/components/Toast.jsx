import { useEffect, useRef, useState } from "react";

export default function Toast({
  message,
  type = "success",
  show,
  onClose
}) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const colors = {
    success: "bg-success",
    error: "bg-danger",
    info: "bg-info",
    warning: "bg-warning text-dark"
  };

  useEffect(() => {
    if (show) {
      setVisible(true);

      // 🔥 reset previous timer if exists
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // start new timer
      timerRef.current = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 3000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [show, message, type]);

  if (!visible) return null;

  return (
    <div
      className={`position-fixed bottom-0 end-0 m-3 p-3 rounded shadow text-white ${colors[type]}`}
      style={{
        minWidth: "220px",
        zIndex: 9999,
        transition: "all 0.2s ease-in-out"
      }}
    >
      {message}
    </div>
  );
}