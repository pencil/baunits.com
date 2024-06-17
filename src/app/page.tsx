import ExternalLink from "@/components/ExternalLink";
import units from "@/data/units.json";
import classNames from "@/helpers/classNames";
import Image from "next/image";

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

const columns = [
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
    render: (unit: Unit) => (
      <ExternalLink href={unit.page_url}>{unit.name}</ExternalLink>
    ),
  },
  { name: "Tech Tier", render: (unit: Unit) => unit.tech_tier },
  { name: "Air/Ground", render: (unit: Unit) => unit.air_ground },
  { name: "Anti-Air?", render: (unit: Unit) => renderBoolean(unit.anti_air) },
  { name: "Splash?", render: (unit: Unit) => renderBoolean(unit.splash) },
  { name: "Melee?", render: (unit: Unit) => renderBoolean(unit.melee) },
  {
    name: "Ability",
    render: (unit: Unit) =>
      unit.ability ? (
        <div title={unit.ability.description}>{unit.ability.name}</div>
      ) : null,
  },
  { name: "Health", render: (unit: Unit) => renderBars(unit.health) },
  { name: "Damage", render: (unit: Unit) => renderBars(unit.damage) },
  { name: "Speed", render: (unit: Unit) => renderBars(unit.speed) },
  { name: "Range", render: (unit: Unit) => renderBars(unit.range) },
  { name: "Matter", render: (unit: Unit) => renderResource(unit.matter) },
  { name: "Energy", render: (unit: Unit) => renderResource(unit.energy) },
  { name: "Bandwidth", render: (unit: Unit) => renderResource(unit.bandwidth) },
];

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <div className="flex-grow overflow-auto md:px-2">
        <table className="relative w-full">
          <thead className="text-left">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.name}
                  className="sticky top-0 px-2 py-3 bg-slate-200 dark:bg-slate-800 text-nowrap z-10"
                >
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {units.map((unit) => (
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
            ))}
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
