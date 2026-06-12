import type { SVGProps } from "react";

export function BotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect x="14" y="18" width="36" height="32" rx="12" className="fill-primary/15" />
      <rect x="17" y="21" width="30" height="26" rx="10" className="fill-background" />
      <path
        d="M24 31.5C24 29.6 25.6 28 27.5 28C29.4 28 31 29.6 31 31.5C31 33.4 29.4 35 27.5 35C25.6 35 24 33.4 24 31.5Z"
        className="fill-primary"
      />
      <path
        d="M33 31.5C33 29.6 34.6 28 36.5 28C38.4 28 40 29.6 40 31.5C40 33.4 38.4 35 36.5 35C34.6 35 33 33.4 33 31.5Z"
        className="fill-primary"
      />
      <path
        d="M26 39C29.5 41.4 34.5 41.4 38 39"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M32 18V11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="9" r="3" className="fill-primary" />
      <path
        d="M14 34H9M55 34H50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M20 50L17 56M44 50L47 56"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
