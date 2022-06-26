import { Button } from "@geist-ui/core";
import { Check } from "@geist-ui/icons";
import { MouseEventHandler, ReactNode } from "react";

export default function HidableButton({
  children,
  hidden = false,
  type = "default",
  icon,
  ml = 0,
  scale = 0.7,
  disabled = false,
  loading = false,
  width = 140,
  onClick = (event) => {},
  done = false,
}: {
  children?: string;
  hidden?: boolean;
  type?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "abort"
    | "secondary-light"
    | "success-light"
    | "warning-light"
    | "error-light";
  icon?: ReactNode;
  ml?: number;
  scale?: number;
  disabled?: boolean;
  loading?: boolean;
  width?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  done?: boolean;
}) {
  return (
    <div className={`root ${hidden ? "hidden" : ""}`}>
      <Button
        type={type}
        icon={done ? <Check /> : icon}
        auto
        scale={scale}
        disabled={disabled}
        loading={loading && !done}
        ml={ml}
        onClick={!done && onClick}
      >
        {done ? "Done" : children}
      </Button>
      <style jsx>{`
        .root {
          transition: width 0.4s ease, padding 0.4s ease, opacity 0.4s ease;
          width: ${done ? 100 : width}px;
        }

        .root.hidden,
        .root.hidden > :global(button) {
          width: 0 !important;
          height: 0 !important;
          padding: 0 !important;
          opacity: 0 !important;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
