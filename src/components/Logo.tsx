import { ImgHTMLAttributes } from "react";

export default function Logo({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img 
      src="/images/logo.jpg" 
      alt="Solid Solutions Logo"
      className={className}
      {...props}
    />
  );
}
