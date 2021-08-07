import { FC } from "react";
import { cn } from "../../utils";
import "./Info.css";

type InfoProps = {
  imageSrc: string;
  imageAlt: string;
  value: string | number;
  label: string;
  highlight?: boolean;
};

export const Info: FC<InfoProps> = ({
  children,
  imageSrc,
  imageAlt,
  value,
  label,
  highlight,
}) => {
  return (
    <div className="Info">
      <img src={imageSrc} className="Info-img" alt={imageAlt} />
      <div className="Info-content">
        <span
          className={cn("Info-value", {
            "Info-value-highlight": !!highlight,
          })}
        >
          {value}
        </span>
        <span className="Info-label">{label}</span>
        {children}
      </div>
    </div>
  );
};
