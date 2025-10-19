import React, { useEffect, useMemo, useRef, useState } from "react";

export default function MonthDropdownButton({
  label = "Download Report",
  monthsCount = 12,
  onSelectMonth,
  align = "right",
  buttonClassName = "",
  buttonIcon = null,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Generate last N months once
  const months = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < monthsCount; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString(undefined, { month: "long", year: "numeric" });
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      list.push({ label, value });
    }
    return list;
  }, [monthsCount]);

  useEffect(() => {
    const handler = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const alignmentClass = align === "left" ? "left-0" : "right-0";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={
          buttonClassName?.trim()
            ? buttonClassName
            : "inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg focus:outline-none"
        }
      >
        {buttonIcon}
        <span>{label}</span>
      </button>

      {open && (
        <div className={`absolute ${alignmentClass} mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50`}>
          <div className="p-2 text-sm font-medium text-gray-700">Select Month</div>
          <ul className="max-h-64 overflow-y-auto">
            {months.map((m) => (
              <li
                key={m.value}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => {
                  onSelectMonth && onSelectMonth(m.value);
                  setOpen(false);
                }}
              >
                {m.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
