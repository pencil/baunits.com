import os
import json
import dataclasses
from typing import Literal, Any
import urllib.request
import datetime


UNIT_PAGE_URL = "https://www.playbattleaces.com/units/{0}"
FIRST_UNIT_URL = UNIT_PAGE_URL.format("crab")
UNIT_ICON_URL = "https://cdn.playbattleaces.com/images/icons/units/{0}.png"
TRAIT_ICON_URL = "https://cdn.playbattleaces.com/images/icons/traits/{0}.png"
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
    unit: dict[str, Any],
) -> Literal["Ground", "Air", "Anti-Air", "Versatile", "Anti-Worker"]:
    if unit["unitDescription"] == "Can only attack workers":
        return "Anti-Worker"
    elif unit["targetsAir"] and unit["targetsGround"]:
        return "Versatile"
    elif unit["targetsAir"]:
        return "Anti-Air"
    return "Ground"


def extract_air_ground(
    unit: dict[str, Any],
) -> Literal["Air", "Ground", "Static", "?"]:
    if unit["statSpeed"] == 0:
        return "Static"
    domain = unit["unitDomain"]
    if domain["slug"] == "air":
        return "Air"
    elif domain["slug"] == "ground":
        return "Ground"
    return "?"


def check_unit_traits(traits: list[dict[str, str]], trait: str) -> bool:
    return any(t["slug"] == trait for t in traits)


def extract_is_melee(unit: dict[str, Any]) -> bool:
    return unit["statRange"] == 1


@dataclasses.dataclass
class Ability:
    name: str
    slug: str
    description: str
    icon_url: str


@dataclasses.dataclass
class Trait:
    name: str
    slug: str
    icon_url: str


@dataclasses.dataclass(eq=False)
class Unit:
    index: int
    name: str
    slug: str
    tech_tier: str
    air_ground: str
    attack_type: str
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

    traits: list[Trait] = dataclasses.field(default_factory=list)
    counters: list[Trait] = dataclasses.field(default_factory=list)
    countered_by: list[Trait] = dataclasses.field(default_factory=list)

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Unit):
            return NotImplemented
        # Compare all fields except index
        return all(
            getattr(self, field.name) == getattr(other, field.name)
            for field in dataclasses.fields(self)[1:]
        )

    @classmethod
    def from_dict(cls, data: dict) -> "Unit":
        data["ability"] = Ability(**data["ability"]) if data["ability"] else None
        data["traits"] = [Trait(**t) for t in data["traits"]] if data["traits"] else []
        data["counters"] = (
            [Trait(**t) for t in data["counters"]] if data["counters"] else []
        )
        data["countered_by"] = (
            [Trait(**t) for t in data["countered_by"]] if data["countered_by"] else []
        )
        if "armor_type" in data:
            del data["armor_type"]
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


def extract_traits(traits: list[dict[str, str]]) -> list[Trait]:
    return [
        Trait(name=t["name"], slug=t["slug"], icon_url=TRAIT_ICON_URL.format(t["slug"]))
        for t in traits
    ]


def unit_from_json(unit: dict, index: int = 0) -> Unit:
    print(unit)
    return Unit(
        index=index,
        name=unit["name"],
        slug=unit["slug"],
        tech_tier=unit["techTier"]["name"],
        traits=extract_traits(unit["unitTraits"]),
        counters=extract_traits(unit["unitCounters"]),
        countered_by=extract_traits(unit["unitCounteredby"]),
        air_ground=extract_air_ground(unit),
        attack_type=extract_attack_type(unit),
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

# Download all trait icons to build/icons/traits/
os.makedirs("public/icons/traits", exist_ok=True)
for unit in units:
    for trait in unit.traits:
        path = f"public/icons/traits/{trait.slug}.png"
        # Skip if the icon is already downloaded
        if os.path.exists(path):
            continue
        icon = get_page_bytes(trait.icon_url)
        with open(path, "wb") as iconfile:
            iconfile.write(icon)
