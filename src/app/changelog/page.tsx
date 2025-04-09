import changelog from "@/data/changelog.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Battle Aces Units Changelog",
  description: "Changelog for Battle Aces units.",
};

const beautifyKey = (key: string) => {
  // Turn attack_type into Attack Type
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const renderDescription = (description?: string) => {
  if (!description) {
    return null;
  }

  return <p className="mb-4">{description}</p>;
};

const formatValue = (value: string | number | boolean): string => {
  if (typeof value === "boolean") {
    return value ? "✅" : "❌";
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return value;
};

const renderUpdatedUnits = (changes: (typeof changelog)[0]["changes"]) => {
  const updatedUnits = changes.filter(
    (change) => change.before !== null && change.after !== null,
  );
  if (updatedUnits.length === 0) {
    return null;
  }

  return (
    <>
      <h3 className="text-lg font-semibold">Updated Units</h3>
      <ul className="list-disc list-inside pl-2 md:pl-4">
        {updatedUnits.map(
          (unit) =>
            unit.after &&
            unit.before && (
              <li key={unit.after.slug}>
                <span className="font-semibold">{unit.after.name}</span>
                <ul className="list-disc list-inside ml-4">
                  {Object.entries(unit.after).map(([key, value]) => {
                    if (
                      key === "slug" ||
                      key === "name" ||
                      key === "ability" ||
                      key === "index"
                    ) {
                      return null;
                    }
                    const valueBefore =
                      unit.before[key as keyof typeof unit.before];

                    // Handle arrays (like traits, counters, countered_by) by joining the names.
                    if (Array.isArray(value) && Array.isArray(valueBefore)) {
                      const getNames = (arr: any[]) =>
                        arr
                          .map((item) =>
                            typeof item === "object" &&
                            item !== null &&
                            "name" in item
                              ? item.name
                              : item,
                          )
                          .join(", ");
                      const formattedArrayAfter = getNames(value);
                      const formattedArrayBefore = getNames(valueBefore);
                      if (formattedArrayBefore === formattedArrayAfter) {
                        return null;
                      }
                      return (
                        <li key={key}>
                          {beautifyKey(key)}: {formattedArrayBefore || "?"} →{" "}
                          {formattedArrayAfter || "?"}
                        </li>
                      );
                    }

                    // Only handle primitives.
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

                    if (valueBefore === value) {
                      return null;
                    }
                    const formattedValue = formatValue(value);
                    const formattedValueBefore = formatValue(valueBefore);

                    return (
                      <li key={key}>
                        {beautifyKey(key)}:{" "}
                        {valueBefore === null ? "?" : formattedValueBefore} →{" "}
                        {formattedValue}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ),
        )}
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
        {newUnits.map(
          (unit) =>
            unit.after && <li key={unit.after.slug}>{unit.after.name}</li>,
        )}
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
        {removedUnits.map(
          (unit) =>
            unit.before && <li key={unit.before.slug}>{unit.before.name}</li>,
        )}
      </ul>
    </>
  );
};

export default function ChangelogPage() {
  return (
    <div className="p-4 w-full max-w-screen-md mx-auto gap-y-2 flex flex-col">
      <h1 className="text-2xl font-semibold">Battle Aces Units Changelog</h1>
      This page aims to document changes to Battle Aces units over time. This
      includes new units, removed units, and changes to existing units. The page
      is automatically updated when the official Battle Aces website is updated.
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
              {renderDescription(entry.description)}
              {renderNewUnits(entry.changes)}
              {renderRemovedUnits(entry.changes)}
              {renderUpdatedUnits(entry.changes)}
            </div>
          </div>
        ))}
    </div>
  );
}
