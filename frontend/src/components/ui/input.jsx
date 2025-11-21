import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${className}`}
      {...props}
    />
  );
}
