"use client";

import ExternalLink from "@/components/ExternalLink";
import units from "@/data/units.json";
import classNames from "@/helpers/classNames";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

type Unit = (typeof units)[0];

const renderBoolean = (value: boolean) => (
  <div aria-label={value ? "Yes" : "No"}>{value ? "✅" : "❌"}</div>
);
const renderBars = (value: number, max = 5) => (
  <div
    className="flex"
    aria-label={`${value} out of ${max}`}
    title={`${value}/${max}`}
  >
    {[...Array(value)].map((_, i) => (
      <div key={i} className="w-3 h-3 bg-blue-600 dark:bg-blue-200 mr-1" />
    ))}
    {[...Array(max - value)].map((_, i) => (
      <div key={i} className="w-3 h-3 bg-slate-200 dark:bg-slate-600 mr-1" />
    ))}
  </div>
);
const renderResource = (value: number) => (
  <div className="w-full text-right">{value}</div>
);
const renderAntiAir = (value: string) => {
  if (value === "Anti-Air") {
    return (
      <span title="Anti-Air: This unit is most effective against air units">
        ✅
      </span>
    );
  } else if (value === "Versatile") {
    return (
      <span title="Versatile: This unit is effective against both air and ground units">
        ⭐️
      </span>
    );
  } else {
    return (
      <span title="Ground: This unit can only attack ground units">❌</span>
    );
  }
};

type FilterString = {
  type: "string";
  val: (unit: Unit) => string;
};
type FilterRange = {
  type: "range";
  min: number;
  max: number;
  step: number;
  val: (unit: Unit) => number;
};
type FilterBoolean = {
  type: "boolean";
  val: (unit: Unit) => boolean;
};
type FilterSelect = {
  type: "select";
  options: string[];
  val: (unit: Unit) => string;
};
type Filter = FilterString | FilterRange | FilterBoolean | FilterSelect;

const uniqueArray = <T extends string | number>(arr: T[]) => {
  // Return only unique values but preserve order
  const unique = new Set<T>(arr);
  return arr.filter((value, idx) => unique.has(value) && unique.delete(value));
};

const findMin = (arr: Unit[], key: "matter" | "energy" | "bandwidth") =>
  Math.min(...arr.map((unit) => unit[key]));
const findMax = (arr: Unit[], key: "matter" | "energy" | "bandwidth") =>
  Math.max(...arr.map((unit) => unit[key]));

export default function Home() {
  const [filters, setFilters] = useState<
    Record<string, (unit: Unit) => boolean>
  >({});
  const [sort, setSort] = useState<{ key: keyof Unit; asc: boolean } | null>(
    null
  );
  const columns = useMemo(
    () => [
      {
        name: "",
        classNames: "w-[3.25rem] min-w-[3.25rem] max-w-[3.25rem]",
        render: (unit: Unit) => (
          <div className="bg-gradient-to-b from-blue-900 to-slate-800 bg-opacity-40 w-9 h-9 p-1 flex justify-center items-center">
            <Image
              unoptimized
              src={`/icons/${unit.slug}.png`}
              alt={unit.name}
              title={unit.name}
              width={32}
              height={32}
            />
          </div>
        ),
      },
      {
        name: "Name",
        key: "name",
        classNames: "w-32 min-w-32 max-w-32 md:w-44 md:min-w-44 md:max-w-44",
        render: (unit: Unit) => (
          <ExternalLink href={unit.page_url}>{unit.name}</ExternalLink>
        ),
        filter: {
          type: "string",
          val: (unit: Unit) => unit.name,
        },
        sortable: true,
      },
      {
        name: "Tech Tier",
        key: "tech_tier",
        sort_key: "index",
        classNames: "w-36 min-w-36 max-w-36 md:w-44 md:min-w-44 md:max-w-44",
        render: (unit: Unit) => unit.tech_tier,
        filter: {
          type: "select",
          options: uniqueArray(units.map((unit) => unit.tech_tier)),
          val: (unit: Unit) => unit.tech_tier,
        },
        sortable: true,
      },
      {
        name: "Air/Ground",
        key: "air_ground",
        classNames: "w-24 min-w-24 max-w-24 md:w-32 md:min-w-32 md:max-w-32",
        render: (unit: Unit) => unit.air_ground,
        filter: {
          type: "select",
          options: uniqueArray(units.map((unit) => unit.air_ground)),
          val: (unit: Unit) => unit.air_ground,
        },
        sortable: true,
      },
      {
        name: "Anti-Air?",
        key: "anti_air",
        render: (unit: Unit) => renderAntiAir(unit.attack_type),
        filter: {
          type: "select",
          options: uniqueArray(units.map((unit) => unit.attack_type)),
          val: (unit: Unit) => unit.attack_type,
        },
      },
      {
        name: "Splash?",
        key: "splash",
        render: (unit: Unit) => renderBoolean(unit.splash),
        filter: { type: "boolean", val: (unit: Unit) => unit.splash },
      },
      {
        name: "Melee?",
        key: "melee",
        render: (unit: Unit) => renderBoolean(unit.melee),
        filter: { type: "boolean", val: (unit: Unit) => unit.melee },
      },
      {
        name: "Ability",
        key: "ability",
        classNames: "w-24 min-w-24 max-w-24 md:w-32 md:min-w-32 md:max-w-32",
        render: (unit: Unit) =>
          unit.ability ? (
            <div title={unit.ability.description}>{unit.ability.name}</div>
          ) : null,
        filter: {
          type: "string",
          val: (unit: Unit) => unit.ability?.name || "",
        },
      },
      {
        name: "Health",
        key: "health",
        render: (unit: Unit) => renderBars(unit.health),
        filter: {
          type: "range",
          min: 1,
          max: 5,
          step: 1,
          val: (unit: Unit) => unit.health,
        },
        sortable: true,
      },
      {
        name: "Damage",
        key: "damage",
        render: (unit: Unit) => renderBars(unit.damage),
        filter: {
          type: "range",
          min: 1,
          max: 5,
          step: 1,
          val: (unit: Unit) => unit.damage,
        },
        sortable: true,
      },
      {
        name: "Speed",
        key: "speed",
        render: (unit: Unit) => renderBars(unit.speed),
        filter: {
          type: "range",
          min: 1,
          max: 5,
          step: 1,
          val: (unit: Unit) => unit.speed,
        },
        sortable: true,
      },
      {
        name: "Range",
        key: "range",
        render: (unit: Unit) => renderBars(unit.range),
        filter: {
          type: "range",
          min: 1,
          max: 5,
          step: 1,
          val: (unit: Unit) => unit.range,
        },
        sortable: true,
      },
      {
        name: "Matter",
        key: "matter",
        render: (unit: Unit) => renderResource(unit.matter),
        // filter: {
        //   type: "range",
        //   min: findMin(units, "matter"),
        //   max: findMax(units, "matter"),
        //   step: 25,
        //   val: (unit: Unit) => unit.matter,
        // },
        sortable: true,
      },
      {
        name: "Energy",
        key: "energy",
        render: (unit: Unit) => renderResource(unit.energy),
        // filter: {
        //   type: "range",
        //   min: findMin(units, "energy"),
        //   max: findMax(units, "energy"),
        //   step: 25,
        //   val: (unit: Unit) => unit.energy,
        // },
        sortable: true,
      },
      {
        name: "Bandwidth",
        key: "bandwidth",
        render: (unit: Unit) => renderResource(unit.bandwidth),
        // filter: {
        //   type: "range",
        //   min: findMin(units, "bandwidth"),
        //   max: findMax(units, "bandwidth"),
        //   step: 1,
        //   val: (unit: Unit) => unit.bandwidth,
        // },
        sortable: true,
      },
    ],
    []
  );

  const renderFilter = useCallback((name: string, f: Filter) => {
    switch (f.type) {
      case "string":
        return (
          <input
            type="text"
            className="w-full px-2 py-1 rounded-md border border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs"
            placeholder="Search"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                [name]: (u: Unit) =>
                  f.val(u).toLowerCase().includes(e.target.value.toLowerCase()),
              }))
            }
          />
        );
      case "range":
        // Only allow filtering min for now
        return (
          <input
            type="number"
            className="w-20 px-2 py-1 rounded-md border border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs"
            placeholder="Min"
            min={f.min}
            max={f.max}
            step={f.step}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                [name]: (u: Unit) =>
                  e.target.value === "" || f.val(u) >= parseInt(e.target.value),
              }))
            }
          />
        );
      case "boolean":
        return (
          <select
            className="w-full px-2 py-1 rounded-md border border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                [name]: (u: Unit) =>
                  e.target.value === "" ||
                  f.val(u) === (e.target.value === "true"),
              }))
            }
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      case "select":
        return (
          <select
            className="w-full px-2 py-1 rounded-md border border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                [name]: (u: Unit) =>
                  e.target.value === "" || f.val(u) === e.target.value,
              }))
            }
          >
            <option value="">Any</option>
            {f.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  }, []);

  const filteredUnits = useMemo(
    () =>
      units
        .filter((unit) =>
          Object.values(filters).every((filter) => filter(unit))
        )
        .sort((a: Unit, b: Unit) => {
          const fallback = a.index - b.index;
          if (sort === null) return fallback;
          const valA = a[sort.key];
          const valB = b[sort.key];
          let res = 0;
          if (typeof valA === "string" && typeof valB === "string") {
            res = valA.localeCompare(valB) * (sort.asc ? 1 : -1);
          } else if (typeof valA === "number" && typeof valB === "number") {
            res = (valA - valB) * (sort.asc ? 1 : -1);
          }
          if (res === 0) res = fallback;
          return res;
        }),
    [filters, sort]
  );

  return (
    <div className="flex flex-col h-screen text-sm md:text-base">
      <div className="flex-grow overflow-auto xl:px-2">
        <table className="relative w-full">
          <thead className="text-left">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={column.name}
                  className={classNames(
                    "sticky top-0 px-2 py-3 bg-slate-200 dark:bg-slate-800 z-10 align-top",
                    column.classNames
                  )}
                >
                  <div className="flex flex-col">
                    {column.sortable ? (
                      <button
                        className="flex items-center"
                        onClick={() =>
                          setSort((prev) =>
                            prev?.key === (column.sort_key || column.key)
                              ? !prev.asc
                                ? null
                                : {
                                    key: (column.sort_key ||
                                      column.key) as keyof Unit,
                                    asc: !prev.asc,
                                  }
                              : {
                                  key: (column.sort_key ||
                                    column.key) as keyof Unit,
                                  asc: true,
                                }
                          )
                        }
                      >
                        <div className="whitespace-nowrap">{column.name}</div>
                        {sort?.key === (column.sort_key || column.key) && (
                          <div className="ml-1">{sort.asc ? "⬆️" : "⬇️"}</div>
                        )}
                      </button>
                    ) : (
                      <div className="whitespace-nowrap">{column.name}</div>
                    )}
                    <div>
                      {column.filter &&
                        renderFilter(column.name, column.filter as Filter)}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUnits.length > 0 ? (
              filteredUnits.map((unit) => (
                <tr
                  key={unit.slug}
                  className="hover:bg-slate-100 dark:hover:bg-slate-900 z-0"
                >
                  {columns.map((column, idx) => (
                    <td
                      key={column.name}
                      className={classNames(
                        "px-2 py-px md:py-2 whitespace-nowrap",
                        idx === 0
                          ? "sticky left-0 bg-slate-200 dark:bg-slate-800 text-center"
                          : ""
                      )}
                    >
                      {column.render(unit)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  No units found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <footer className="p-2 text-sm text-slate-600 dark:text-slate-400 flex flex-col gap-y-4">
          <p>
            BAUnits.com is a fan-made website for the game Battle Aces by
            Uncapped Games. You can help improve this site by contributing on{" "}
            <ExternalLink href="https://github.com/pencil/baunits.com">
              GitHub
            </ExternalLink>
            .
          </p>
          <p>
            Server hosting provided by{" "}
            <ExternalLink href="https://www.smartinary.com">
              Smartinary
            </ExternalLink>
            .
          </p>
          <p>
            Battle Aces and Uncapped Games are trademarks in the EU and other
            Countries. This site is not affiliated with or endorsed by Battle
            Aces or Uncapped Games. Data and images sourced from the{" "}
            <ExternalLink href="https://www.playbattleaces.com/units">
              official Battle Aces website
            </ExternalLink>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
