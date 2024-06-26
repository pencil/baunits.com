"use client";

import ExternalLink from "@/components/ExternalLink";
import TextTooltip from "@/components/TextTooltip";
import Tooltip from "@/components/Tooltip";
import units from "@/data/units.json";
import classNames from "@/helpers/classNames";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

type Unit = (typeof units)[0];

const renderBoolean = (value: boolean) => (
  <div aria-label={value ? "Yes" : "No"}>{value ? "✅" : "❌"}</div>
);
const renderBars = (value: number, max = 5) => (
  <Tooltip tooltip={`${value}/${max}`} position="bottom">
    <div className="flex" aria-label={`${value} out of ${max}`}>
      {[...Array(value)].map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 md:w-3 md:h-3 bg-blue-600 dark:bg-blue-200 mr-1"
        />
      ))}
      {[...Array(max - value)].map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 md:w-3 md:h-3 bg-slate-200 dark:bg-slate-600 mr-1"
        />
      ))}
    </div>
  </Tooltip>
);
const renderResource = (value: number) => (
  <div className="w-full text-right">{value}</div>
);
const renderAttackType = (value: string) => {
  switch (value) {
    case "Anti-Air":
      return (
        <TextTooltip tooltip="This unit is most effective against air units.">
          Anti-Air
        </TextTooltip>
      );
    case "Anti-Worker":
      return (
        <TextTooltip tooltip="This unit is can only attack workers.">
          Anti-Worker
        </TextTooltip>
      );
    case "Ground":
      return (
        <TextTooltip tooltip="This unit can only attack ground units.">
          Ground
        </TextTooltip>
      );
    case "Versatile":
      return (
        <TextTooltip tooltip="This unit is effective against both air and ground units.">
          Versatile
        </TextTooltip>
      );
    default:
      return value;
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
          <Tooltip tooltip={unit.name} position="right">
            <div className="bg-gradient-to-b from-blue-900 to-slate-800 bg-opacity-40 w-9 h-9 p-1 flex justify-center items-center">
              <Image
                unoptimized
                src={`/icons/${unit.slug}.png`}
                alt={unit.name}
                width={32}
                height={32}
              />
            </div>
          </Tooltip>
        ),
      },
      {
        name: "Name",
        key: "name",
        classNames: "w-32 min-w-32 max-w-32 md:w-40 md:min-w-40 md:max-w-40",
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
        name: "Type",
        key: "air_ground",
        classNames: "w-20 min-w-20 max-w-20 md:w-24 md:min-w-24 md:max-w-24",
        render: (unit: Unit) => unit.air_ground,
        filter: {
          type: "select",
          options: uniqueArray(units.map((unit) => unit.air_ground)),
          val: (unit: Unit) => unit.air_ground,
        },
        sortable: true,
      },
      {
        name: "Attacks",
        key: "attack_type",
        classNames: "w-24 min-w-24 max-w-24 md:w-32 md:min-w-32 md:max-w-32",
        render: (unit: Unit) => renderAttackType(unit.attack_type),
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
        classNames: "w-24 min-w-24 md:w-28 md:min-w-28 md:max-w-28",
        render: (unit: Unit) =>
          unit.ability ? (
            <TextTooltip tooltip={unit.ability.description}>
              {unit.ability.name}
            </TextTooltip>
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
        numeric: true,
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
        numeric: true,
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
        numeric: true,
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
            className="w-full px-2 py-1 rounded-md border border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-normal"
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
            className="w-16 md:w-20 px-2 py-1 rounded-md border border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-normal"
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
            className="w-full px-2 py-1 rounded-md border border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-normal"
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
            className="w-full px-2 py-1 rounded-md border border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-normal"
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
    <table className="relative w-full">
      <thead className="text-left">
        <tr>
          {columns.map((column) => (
            <th
              key={column.name}
              className={classNames(
                "sticky top-0 px-2 py-3 bg-slate-200 dark:bg-slate-800 z-40 align-top",
                column.classNames
              )}
            >
              <div className="flex flex-col font-semibold">
                {column.sortable ? (
                  <button
                    className={classNames(
                      "flex items-center",
                      column.numeric ? "justify-end" : "justify-start"
                    )}
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
                      ? "sticky z-20 left-0 bg-slate-200 dark:bg-slate-800 text-center"
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
  );
}
