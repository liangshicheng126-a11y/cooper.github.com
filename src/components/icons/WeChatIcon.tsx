import React from "react";

const WeChatIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 10c0-2.21-2.46-4-5.5-4C8.46 6 6 7.79 6 10c0 1.28.81 2.41 2.06 3.14l-.44 1.36L9 13.5c.78.31 1.63.5 2.5.5.34 0 .67-.03 1-.09" />
    <path d="M18.15 13.15c2.01.62 3.35 1.74 3.35 3.1 0 1.93-2.13 3.5-4.75 3.5-.73 0-1.42-.12-2.03-.35l-1.07.65.38-1.18c-1.07-.63-1.75-1.58-1.75-2.62 0-.32.06-.63.18-.92" />
  </svg>
);

export default WeChatIcon;
