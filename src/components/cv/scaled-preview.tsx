import { useEffect, useRef, useState, type ReactNode } from "react";

export function ScaledPreview({ children, className = "" }: { children: ReactNode; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth;
      if (w < 8) return;
      setScale(Math.min(1, w / 794));
    };
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply();
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={host} className={`w-full overflow-hidden ${className}`}>
      <div style={{ height: 1123 * scale }} className="relative max-w-full">
        <div
          className="origin-top-left"
          style={{
            transform: `scale(${scale})`,
            width: 794,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
