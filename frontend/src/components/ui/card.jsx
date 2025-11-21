import React from "react";

// Main Card wrapper
export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-xl shadow-md p-4 bg-white dark:bg-gray-800 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// CardContent wrapper
export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

// CardHeader wrapper
export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`mb-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

// CardTitle wrapper
export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3 className={`text-lg font-bold ${className}`} {...props}>
      {children}
    </h3>
  );
}
