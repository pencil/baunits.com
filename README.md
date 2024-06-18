# BAUnits.com

This repository contains the source code for the BAUnits.com website. The
website is built using Next.js, a React framework for building static and
server-rendered websites.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

## Unit updates

To update the units, run the following command:

```bash
python3 dev/unit-dl.py
```

This will download the latest units from the Battle Aces website and save them
to `src/data/units.json`.

The GitHub repository is set up to run this script daily using GitHub Actions.
