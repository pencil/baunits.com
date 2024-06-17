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
  const columns = useMemo(
    () => [
      {
        name: "",
        render: (unit: Unit) => (
          <div className="bg-gradient-to-b from-blue-900 to-slate-800 bg-opacity-40 w-9 h-9 p-1 flex justify-center items-center">
            <Image
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
        render: (unit: Unit) => (
          <ExternalLink href={unit.page_url}>{unit.name}</ExternalLink>
        ),
        filter: {
          type: "string",
          val: (unit: Unit) => unit.name,
        },
      },
      {
        name: "Tech Tier",
        key: "tech_tier",
        render: (unit: Unit) => unit.tech_tier,
        filter: {
          type: "select",
          options: uniqueArray(units.map((unit) => unit.tech_tier)),
          val: (unit: Unit) => unit.tech_tier,
        },
      },
      {
        name: "Air/Ground",
        key: "air_ground",
        render: (unit: Unit) => unit.air_ground,
        filter: {
          type: "select",
          options: uniqueArray(units.map((unit) => unit.air_ground)),
          val: (unit: Unit) => unit.air_ground,
        },
      },
      {
        name: "Anti-Air?",
        key: "anti_air",
        render: (unit: Unit) => renderBoolean(unit.anti_air),
        filter: { type: "boolean", val: (unit: Unit) => unit.anti_air },
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
      },
      {
        name: "Matter",
        key: "matter",
        render: (unit: Unit) => renderResource(unit.matter),
        filter: {
          type: "range",
          min: findMin(units, "matter"),
          max: findMax(units, "matter"),
          step: 25,
          val: (unit: Unit) => unit.matter,
        },
      },
      {
        name: "Energy",
        key: "energy",
        render: (unit: Unit) => renderResource(unit.energy),
        filter: {
          type: "range",
          min: findMin(units, "energy"),
          max: findMax(units, "energy"),
          step: 25,
          val: (unit: Unit) => unit.energy,
        },
      },
      {
        name: "Bandwidth",
        key: "bandwidth",
        render: (unit: Unit) => renderResource(unit.bandwidth),
        filter: {
          type: "range",
          min: findMin(units, "bandwidth"),
          max: findMax(units, "bandwidth"),
          step: 1,
          val: (unit: Unit) => unit.bandwidth,
        },
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
                [name]: (u: Unit) => f.val(u) >= parseInt(e.target.value),
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

  const filteredUnits = units.filter((unit) =>
    Object.values(filters).every((filter) => filter(unit))
  );

  return (
    <main className="flex flex-col h-screen">
      <div className="flex-grow overflow-auto md:px-2">
        <table className="relative w-full">
          <thead className="text-left">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.name}
                  className="sticky top-0 px-2 py-3 bg-slate-200 dark:bg-slate-800 z-10 align-top"
                >
                  <div className="flex flex-col">
                    <div className=" text-nowrap">{column.name}</div>
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
                        "px-2 py-2",
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
        <div className="p-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Battle Aces is a trademark, and Uncapped Games is a trademark in the
          EU and other Countries. This site is not affiliated with or endorsed
          by Battle Aces or Uncapped Games. Data and images sourced from the{" "}
          <ExternalLink href="https://www.playbattleaces.com/units">
            official Battle Aces website
          </ExternalLink>
          .
        </div>
      </div>
    </main>
  );
}