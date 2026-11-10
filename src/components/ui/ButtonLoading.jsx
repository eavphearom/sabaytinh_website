import { RefreshCw } from "lucide-react";

export default function ButtonLoading({ children }) {
  return (
    <span role="status" className="inline-flex items-center justify-center gap-2">
      {children}
      <RefreshCw size={18} aria-hidden="true" className="shrink-0 animate-spin motion-reduce:animate-none" />
      <span className="sr-only">Loading</span>
    </span>
  );
}
