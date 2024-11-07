import Tooltip from "./Tooltip";

type Props = {
  children: string;
  tooltip?: string;
  position?: "bottom" | "left" | "right";
};
export default function TextTooltip({
  children,
  tooltip,
  position = "bottom",
}: Props) {
  if (!tooltip) {
    return <>{children}</>;
  }

  return (
    <Tooltip tooltip={tooltip} position={position}>
      <span className="underline decoration-dotted">{children}</span>
    </Tooltip>
  );
}
