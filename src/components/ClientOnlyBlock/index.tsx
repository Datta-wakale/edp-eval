import React, { useEffect, useState } from 'react';

type ClientOnlyBlockProps = React.PropsWithChildren;

export default function ClientOnlyBlock({
  children,
}: ClientOnlyBlockProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Simulated runtime feature flag.
    // For this assignment, the flag is OFF.
    const runtimeFlag = false;
    setEnabled(runtimeFlag);
  }, []);

  if (!enabled) {
    return null;
  }

  return <>{children}</>;
}