import Tooltip from "./Tooltip";

type Props = {
  children: string;
  tooltip?: string;
};
export default function TextTooltip({ children, tooltip }: Props) {
  if (!tooltip) {
    return <>{children}</>;
  }

  return (
    <Tooltip tooltip={tooltip} position="bottom">
      <span className="underline decoration-dotted">{children}</span>
    </Tooltip>
  );
}
