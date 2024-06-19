import Tooltip from "./Tooltip";

type Props = {
  children: string;
  tooltip: string;
};
export default function TextTooltip({ children, tooltip }: Props) {
  return (
    <Tooltip tooltip={tooltip}>
      <span className="underline decoration-dotted">{children}</span>
    </Tooltip>
  );
}
