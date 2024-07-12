import changelog from "@/data/changelog.json";

const beautifyKey = (key: string) => {
  // Turn attack_type into Attack Type
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const renderUpdatedUnits = (changes: (typeof changelog)[0]["changes"]) => {
  const updatedUnits = changes.filter(
    (change) => change.before !== null && change.after !== null
  );
  if (updatedUnits.length === 0) {
    return null;
  }

  return (
    <>
      <h3 className="text-lg font-semibold">Updated Units</h3>
      <ul className="list-disc list-inside pl-2 md:pl-4">
        {updatedUnits.map((unit) => (
          <li key={unit.after.slug}>
            <span className="font-semibold">{unit.after.name}</span>
            <ul className="list-disc list-inside ml-4">
              {Object.entries(unit.after).map(([key, value]) => {
                if (key === "slug" || key === "name" || key === "ability") {
                  return null;
                }
                const valueBefore = unit.before[key as keyof typeof unit.after];
                if (valueBefore == value) {
                  return null;
                }
                if (
                  (typeof value !== "string" &&
                    typeof value !== "number" &&
                    typeof value !== "boolean") ||
                  (typeof valueBefore !== "string" &&
                    typeof valueBefore !== "number" &&
                    typeof valueBefore !== "boolean")
                ) {
                  return null;
                }

                return (
                  <li key={key}>
                    {beautifyKey(key)}:{" "}
                    {valueBefore === null ? "?" : valueBefore} → {value}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
};

const renderNewUnits = (changes: (typeof changelog)[0]["changes"]) => {
  const newUnits = changes.filter((change) => change.before === null);
  if (newUnits.length === 0) {
    return null;
  }

  return (
    <>
      <h3 className="text-lg font-semibold">New Units</h3>
      <ul className="list-disc list-inside pl-2 md:pl-4">
        {newUnits.map((unit) => (
          <li key={unit.after.slug}>{unit.after.name}</li>
        ))}
      </ul>
    </>
  );
};

const renderRemovedUnits = (changes: (typeof changelog)[0]["changes"]) => {
  const removedUnits = changes.filter((change) => change.after === null);
  if (removedUnits.length === 0) {
    return null;
  }

  return (
    <>
      <h3 className="text-lg font-semibold">Removed Units</h3>
      <ul className="list-disc list-inside pl-2 md:pl-4">
        {removedUnits.map((unit) => (
          <li key={unit.before.slug}>{unit.before.name}</li>
        ))}
      </ul>
    </>
  );
};

export default function ChangelogPage() {
  return (
    <div className="p-4 w-full max-w-screen-md mx-auto gap-y-2 flex flex-col">
      <h1 className="text-2xl font-semibold pb-2">Changelog</h1>
      {changelog
        .slice()
        .reverse()
        .map((entry) => (
          <div
            key={entry.date}
            className="border rounded-lg p-4 mb-4 shadow-sm bg-slate-100 dark:bg-slate-950"
          >
            <h2 className="text-xl font-semibold pb-2">{entry.date}</h2>
            <div>
              {renderNewUnits(entry.changes)}
              {renderRemovedUnits(entry.changes)}
              {renderUpdatedUnits(entry.changes)}
            </div>
          </div>
        ))}
    </div>
  );
}
