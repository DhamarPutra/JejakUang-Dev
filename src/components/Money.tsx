import { idr } from "../utils/format";
import { useMoneyVisibility } from "../components/MoneyVisibilityContext";

export default function Money({ value }: { value: number }) {
  const { show } = useMoneyVisibility();
  const masked = "********";

  return (
    <div style={{ fontSize: 22, fontWeight: 700 }}>
      {show ? (
        idr.format(value)
      ) : (
        <span className="hidden-amount">{masked}</span>
      )}
    </div>
  );
}
