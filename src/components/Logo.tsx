import { SVGProps } from "react";

export default function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="200" 
      height="200" 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        {/* Outer nested curves */}
        <path d="M30,75 Q15,50 30,25" />
        <path d="M42,82 Q25,50 42,18" />
        <path d="M55,85 Q38,50 55,15" />
        
        {/* Inner rings */}
        <ellipse cx="65" cy="50" rx="15" ry="25" transform="rotate(-15, 65, 50)" />
        <ellipse cx="65" cy="50" rx="7" ry="12" transform="rotate(-15, 65, 50)" />
        
        {/* Accented dot */}
        <ellipse cx="85" cy="35" rx="3" ry="5" fill="currentColor" transform="rotate(-15, 85, 35)" />
      </g>
    </svg>
  );
}
