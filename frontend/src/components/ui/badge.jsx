import React from "react";

export function Badge({ children, className = "", ...props }) {
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-200 text-purple-800 dark:bg-purple-600 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
