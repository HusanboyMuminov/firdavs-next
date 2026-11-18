import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-5.8H9.2v5.8H5A1.5 1.5 0 0 1 3.5 19z" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="3.5" width="14" height="17" rx="2" />
    <path d="M9 8.5h6M9 12h6M9 15.5h3.5" />
  </Svg>
);

export const HeartIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Svg {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7.2-4.4-7.2-10.1A4.1 4.1 0 0 1 12 7.3a4.1 4.1 0 0 1 7.2 2.6C19.2 15.6 12 20 12 20z" />
  </Svg>
);

export const InfoIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.2M12 7.9v.1" />
  </Svg>
);

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.3-4.3" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </Svg>
);

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.2 3.8h2.6l1.6 4.4-2 1.3a11.6 11.6 0 0 0 6.1 6.1l1.3-2 4.4 1.6v2.6a2 2 0 0 1-2.2 2A16.4 16.4 0 0 1 4.2 6a2 2 0 0 1 2-2.2z" />
  </Svg>
);

export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20.8s6.6-5.8 6.6-11A6.6 6.6 0 0 0 5.4 9.8c0 5.2 6.6 11 6.6 11z" />
    <circle cx="12" cy="9.8" r="2.4" />
  </Svg>
);

export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const CopyIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
    <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.5 4.4 4.4L19 7.4" />
  </Svg>
);

export const ArrowIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5" />
  </Svg>
);

export const BagIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5.5 8.5h13l-1 11.5h-11z" />
    <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
  </Svg>
);

export const ScooterIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="6.5" cy="17" r="2.5" />
    <circle cx="17.5" cy="17" r="2.5" />
    <path d="M9 17h6l2-7h-3M14 10l-3.5 7M4 12.5h5" />
  </Svg>
);

export const FlameIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21c-3.6 0-6.2-2.6-6.2-5.9 0-2.7 1.6-4.3 2.8-6.1.4 1.4 1.2 2.3 2.2 2.8.1-3.3 1.6-6.1 4.2-8 .1 2.8 1.6 4.4 2.6 6.2.6 1.1.9 2.3.9 3.6 0 4.3-2.8 7.4-6.5 7.4z" />
  </Svg>
);

export const LeafIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 19c0-7.6 4.8-12.6 14-14-.8 8.8-6 14-14 14z" />
    <path d="M5 19l7.5-7.5" />
  </Svg>
);

export const UsersIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0M15.5 5.8a3 3 0 0 1 0 5.4M17 14.2a5 5 0 0 1 3.5 4.8" />
  </Svg>
);

export const GlobeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5s1.2-6.1 3.5-8.5z" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
  </Svg>
);

export const MessageIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 19 17h-8.5l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 5 4.5z" />
    <path d="M7.5 9h9M7.5 12.5h5.5" />
  </Svg>
);

export const TelegramIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.6 4.2 3.4 10.9c-.8.3-.8 1.4 0 1.7l4.2 1.5 1.6 5c.2.7 1.1.9 1.6.4l2.4-2.3 4.3 3.1c.6.4 1.4.1 1.6-.6l2.9-14.2c.2-.8-.6-1.5-1.4-1.3z" />
    <path d="m7.6 14.1 9.2-6.1-6.4 7.2" />
  </Svg>
);

export const WhatsAppIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.6 19.4 5.7 16A8.2 8.2 0 1 1 8.6 18.6z" />
    <path d="M9.3 8.4c.2-.4.6-.4.9-.4l.6 1.4c.1.3 0 .5-.2.7l-.4.5c.6 1.2 1.5 2.1 2.7 2.7l.5-.4c.2-.2.4-.3.7-.2l1.4.6c0 .3 0 .7-.4.9-.6.5-1.4.6-2.1.3a8 8 0 0 1-3.9-3.9c-.3-.7-.2-1.6.2-2.2z" />
  </Svg>
);

export const BellIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
    <path d="M10 20.5a2.1 2.1 0 0 0 4 0" />
  </Svg>
);

export const ActivityIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 12.5h4l2.5-6.5 4 13 2.5-6.5h4" />
  </Svg>
);

export const SendIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4z" />
  </Svg>
);

export const LogoutIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 4.5H18a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-3.5M10 8l-4 4 4 4M6 12h9.5" />
  </Svg>
);

export const ExternalIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4.5h5.5V10M19.5 4.5 11 13M18 14v4a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 18V8a1.5 1.5 0 0 1 1.5-1.5h4" />
  </Svg>
);
