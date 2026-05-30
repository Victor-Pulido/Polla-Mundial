import React, { useState } from "react";

export default function FlagImage({ code, name, size = 32 }) {
  const [errored, setErrored] = useState(false);
  const flagCode = code.toLowerCase();
  const width  = size;
  const height = Math.round(size * 0.67);

  if (errored) {
    return (
      <div
        style={{ width, height }}
        className="rounded bg-brand-card-hover border border-brand-border flex items-center justify-center text-xs font-mono text-brand-text-muted shrink-0"
        aria-hidden="true"
      >
        {code.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w80/${flagCode}.png`}
      width={width}
      height={height}
      alt={name}
      loading="lazy"
      className="rounded object-cover shrink-0 shadow-sm"
      onError={() => setErrored(true)}
    />
  );
}
