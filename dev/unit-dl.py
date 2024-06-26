import os
import json
import dataclasses
from typing import Literal
import urllib.request
import datetime


UNIT_PAGE_URL = "https://www.playbattleaces.com/units/{0}"
FIRST_UNIT_URL = UNIT_PAGE_URL.format("crab")
UNIT_ICON_URL = "https://cdn.playbattleaces.com/images/icons/units/{0}.png"
ABILITY_ICON_URL = "https://cdn.playbattleaces.com/images/icons/abilities/{0}.png"

CSV = False
MD = False
JSON = True
ICONS = True
CHANGELOG = True


def get_page_bytes(url) -> bytes:
    with urllib.request.urlopen(url) as response:
        return response.read()


def get_page_string(url) -> str:
    return get_page_bytes(url).decode("utf-8")


# Download the page and extract JSON from <script id="__NEXT_DATA__" ...>
def get_page_json(url) -> dict:
    page = get_page_string(url)
    sep1, sep2 = '<script id="__NEXT_DATA__" type="application/json">', "</script>"
    page_json = page.split(sep1)[1].split(sep2)[0]
    return json.loads(page_json)


def extract_attack_type(
    tag: str,
) -> Literal["Ground", "Air", "Anti-Air", "Versatile", "Anti-Worker"]:
    if tag.startswith("Anti-Air"):
        return "Anti-Air"
    elif tag.startswith("Versatile"):
        return "Versatile"
    elif tag.startswith("Anti-Worker"):
        return "Anti-Worker"
    return "Ground"


def extract_armor_type(tag: str) -> Literal["Normal", "Durable"]:
    if " Durable " in tag:
        return "Durable"
    return "Normal"


def extract_air_ground(tag: str) -> Literal["Air", "Ground", "Static", "?"]:
    if tag.endswith("Air Unit"):
        return "Air"
    elif tag.endswith("Ground Unit"):
        return "Ground"
    elif tag.endswith("Base Defense"):
        return "Static"
    return "?"


def extract_has_splash(tag: str) -> bool:
    return "Splash" in tag


def extract_is_melee(tag: str) -> bool:
    return "Melee" in tag


@dataclasses.dataclass
class Ability:
    name: str
    slug: str
    description: str
    icon_url: str


@dataclasses.dataclass(eq=False)
class Unit:
    index: int
    name: str
    slug: str
    tech_tier: str
    air_ground: str
    attack_type: str
    armor_type: str
    splash: bool
    melee: bool
    ability: Ability | None
    health: int
    damage: int
    speed: int
    range: int
    matter: int
    energy: int
    bandwidth: int
    war_credits: int | None
    page_url: str
    icon_url: str

    def __eq__(self, other: "Unit") -> bool:
        # Compare all fields except index
        return all(
            getattr(self, field.name) == getattr(other, field.name)
            for field in dataclasses.fields(self)[1:]
        )

    @classmethod
    def from_dict(cls, data: dict) -> "Unit":
        data["ability"] = Ability(**data["ability"]) if data["ability"] else None
        return cls(**data)


@dataclasses.dataclass
class UnitChange:
    before: Unit
    after: Unit


@dataclasses.dataclass
class ChangeLog:
    # Date in yyyy-mm-dd format
    date: str
    changes: list[UnitChange]


with open("src/data/warcredits.json", "r") as jsonfile:
    unlock_cost_by_unit = json.load(jsonfile)


def unit_from_json(unit: dict, index: int = 0) -> Unit:
    unit["unitTag"] = unit["unitTag"].strip()
    return Unit(
        index=index,
        name=unit["name"],
        slug=unit["slug"],
        tech_tier=unit["techTier"]["name"],
        air_ground=extract_air_ground(unit["unitTag"]),
        attack_type=extract_attack_type(unit["unitTag"]),
        armor_type=extract_armor_type(unit["unitTag"]),
        splash=extract_has_splash(unit["unitTag"]),
        melee=extract_is_melee(unit["unitTag"]),
        ability=Ability(
            name=unit["unitAbility"]["name"],
            slug=unit["unitAbility"]["slug"],
            description=unit["unitAbility"]["description"],
            icon_url=ABILITY_ICON_URL.format(unit["unitAbility"]["slug"]),
        )
        if unit["unitAbility"]
        else None,
        health=unit["statHealth"],
        damage=unit["statDamage"],
        speed=unit["statSpeed"],
        range=unit["statRange"],
        matter=unit["costMatter"],
        energy=unit["costEnergy"],
        war_credits=unlock_cost_by_unit.get(unit["slug"]),
        bandwidth=unit["costBandwidth"],
        page_url=UNIT_PAGE_URL.format(unit["slug"]),
        icon_url=UNIT_ICON_URL.format(unit["slug"]),
    )


data = get_page_json(FIRST_UNIT_URL)

units = [
    unit_from_json(unit, idx)
    for idx, unit in enumerate(data["props"]["pageProps"]["units"])
]
if CSV:
    import csv

    print("Writing units to build/units.csv")
    with open("build/units.csv", "w+", newline="") as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(
            [
                "Name",
                "Tech Tier",
                "Air/Ground",
                "Anti-Air?",
                "Splash?",
                "Melee?",
                "Ability",
                "Health",
                "Damage",
                "Speed",
                "Range",
                "Matter",
                "Energy",
                "Bandwidth",
                "URL",
            ]
        )

        for unit in units:
            csvwriter.writerow(
                [
                    unit.name,
                    unit.tech_tier,
                    unit.air_ground,
                    unit.attack_type,
                    unit.splash,
                    unit.melee,
                    unit.ability.name if unit.ability else "",
                    unit.health,
                    unit.damage,
                    unit.speed,
                    unit.range,
                    unit.matter,
                    unit.energy,
                    unit.bandwidth,
                    unit.page_url,
                ]
            )


if MD:
    print("Writing units to build/units.md")
    with open("build/units.md", "w+") as mdfile:
        mdfile.write("# Units\n\n")
        mdfile.write(
            "| Icon | Name | Tech Tier | Air/Ground | Anti-Air? | Splash? | Melee? | Ability | Health | Damage | Speed | Range | Matter | Energy | Bandwidth |\n"
        )
        mdfile.write(
            "|------|------|-----------|------------|----------|---------|--------|---------|--------|--------|-------|-------|--------|--------|-----------|\n"
        )

        for unit in units:
            mdfile.write(
                f"| <div style='background: linear-gradient(180deg,rgba(12,47,100,.5),rgba(12,47,100,0)) #00000066; width: 34px; height: 34px; padding: 1px; display: flex; justify-content: center; align-items: center;'><img src='{unit.icon_url}' style='max-width: 100%; max-height: 100%;'></div> "
                f"| [{unit.name}]({unit.page_url}) "
                f"| {unit.tech_tier} "
                f"| {unit.air_ground} "
                f"| {unit.attack_type} "
                f"| {unit.splash} "
                f"| {unit.melee} "
                f"| {unit.ability.name if unit.ability else ''} "
                f"| <div style='white-space: nowrap;'>{unit.health * '❤️'}</div> "
                f"| <div style='white-space: nowrap;'>{unit.damage * '⚔️'}</div> "
                f"| <div style='white-space: nowrap;'>{unit.speed * '🏃'}</div> "
                f"| <div style='white-space: nowrap;'>{unit.range * '🎯'}</div> "
                f"| <div style='white-space: nowrap;'>{int(unit.matter / 25) * '🔧'}</div> "
                f"| <div style='white-space: nowrap;'>{int(unit.energy / 25) * '⚡' if unit.energy > 0 else '-'}</div> "
                f"| <div style='white-space: nowrap;'>{unit.bandwidth * '📶' if unit.bandwidth > 0 else '-'}</div>\n"
            )


existing_units: list[Unit] = []
if CHANGELOG and os.path.exists("src/data/units.json"):
    with open("src/data/units.json", "r") as jsonfile:
        existing_units = [Unit.from_dict(unit) for unit in json.load(jsonfile)]

with open("src/data/units.json", "w+") as jsonfile:
    print(f"Writing {len(units)} units to src/data/units.json")
    json.dump([dataclasses.asdict(unit) for unit in units], jsonfile, indent=2)

if existing_units:
    existing_changelog: list[ChangeLog] = []
    if os.path.exists("src/data/changelog.json"):
        with open("src/data/changelog.json", "r") as jsonfile:
            existing_changelog = json.load(jsonfile)

    existing_units_by_slug = {unit.slug: unit for unit in existing_units}
    unit_slugs = [unit.slug for unit in units]
    unit_changes: list[UnitChange] = []
    for unit in existing_units:
        if unit.slug not in unit_slugs:
            unit_changes.append(UnitChange(before=unit, after=None))
    for unit in units:
        if unit.slug not in existing_units_by_slug:
            unit_changes.append(UnitChange(before=None, after=unit))
        else:
            existing_unit = existing_units_by_slug[unit.slug]
            if unit != existing_unit:
                unit_changes.append(UnitChange(before=existing_unit, after=unit))

    if unit_changes:
        changelog = ChangeLog(
            date=datetime.date.today().isoformat(), changes=unit_changes
        )
        existing_changelog.append(dataclasses.asdict(changelog))
        with open("src/data/changelog.json", "w+") as jsonfile:
            print(f"Writing {len(unit_changes)} changes to src/data/changelog.json")
            json.dump(existing_changelog, jsonfile, indent=2)

# Download all icons to build/icons/
os.makedirs("public/icons", exist_ok=True)
for unit in units:
    path = f"public/icons/{unit.slug}.png"
    print(path, end=" ")
    # Skip if the icon is already downloaded
    if os.path.exists(path):
        print("exists")
        continue
    icon = get_page_bytes(unit.icon_url)
    with open(path, "wb") as iconfile:
        iconfile.write(icon)
        print("downloaded")
