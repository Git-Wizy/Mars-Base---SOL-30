/* DATA: NASA DONKI saved record (offline fallback), the five daily jobs, and the five story events. */
const DONKI = {
  id: "2024-05-08T04:37:00-FLR-001",
  cls: "X1.0",
  date: "8 May 2024",
  region: "Active Region 13664",
  link: "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/FLR/30551/4",
};

const A = {
  research: {
    n: `Do outdoor research`,
    d: `Collect rock and dust samples. Costs 8 power.`,
    off: () =>
      S.storm > 0 && S.mode === "shelter"
        ? `Crew is sheltering from the storm`
        : "",
    f() {
      S.power -= 8;
      let g = S.dustMode === "low" && S.dust > 0 ? 4 : 8,
        x = "";
      if (S.storm > 0 && S.mode === "work") {
        g = 12;
        hit(30);
        x = ` Working outside during the storm added 30 simulated radiation units and hurt crew health.`;
      }
      S.research += g;
      return `You collected samples. Research +${g}.${x}`;
    },
    sci: `Science needs electricity. Every hour spent on research is power that life support can’t use.`,
  },
  recycle: {
    n: `Run the water and air recycler`,
    d: `Costs 10 power, restores 16 life support.`,
    f() {
      S.power -= 10;
      S.life += 16;
      return `The recycler cleaned the water and air.`;
    },
    sci: `Mars crews can’t carry endless supplies, so they recycle. But recycling pumps and heaters use power, so life support and power are linked.`,
  },
  greenhouse: {
    n: `Plant a greenhouse crop`,
    d: `Costs 6 power and a little water. Food arrives in 5 sols.`,
    f() {
      S.power -= 6;
      S.life -= 3;
      S.crops.push(S.sol + 5);
      return `You planted a crop. It will be ready on sol ${S.sol + 5}.`;
    },
    sci: `Plants take time. Food you plant today can’t help you today, so a good crew plans ahead.`,
  },
  panels: {
    n: `Sweep dust off the solar panels`,
    d: `Brings back power right away.`,
    f() {
      const g = S.dust > 0 ? 7 : 14;
      S.power += g;
      return `The panels shine again. Power +${g}.`;
    },
    sci: `Dust blocks sunlight. Clean panels make more electricity, and that is the base’s only income.`,
  },
  rest: {
    n: `Rest and check on the crew`,
    d: `Crew health +6. Costs 2 power.`,
    f() {
      S.health += 6;
      S.power -= 2;
      return `The crew rested and felt better.`;
    },
    sci: `Tired astronauts make mistakes. Rest is part of mission safety.`,
  },
};
const EV = {
  6: {
    t: `A dust storm is coming!`,
    b: `Thick dust will block sunlight for 4 sols, so your solar panels will make much less power.`,
    earth: `Earth reply: “Dust storms can last weeks. Save power until it clears.”`,
    ch: [
      {
        l: `Switch to low-power mode`,
        s: `Upkeep drops from 8 to 3 power per sol, but research is cut in half.`,
        f() {
          S.dust = 4;
          S.dustMode = "low";
          return `You switched off non-essential machines.`;
        },
        sci: `Real Mars rovers go into low-power mode in dust storms. Saving energy keeps the important systems alive.`,
      },
      {
        l: `Keep everything running`,
        s: `Normal upkeep and research, but power will run down fast.`,
        f() {
          S.dust = 4;
          S.dustMode = "";
          return `You kept everything on.`;
        },
        sci: `Full speed works only if you have enough power in the bank. Check your power meter!`,
      },
    ],
  },
  12: {
    t: `Solar flare alert!`,
    real: true,
    b: `The Sun just launched a burst of energy and particles. Mars has no thick air or strong magnetic field to block them, so people outside could get a dose of radiation.`,
    earth: `Earth reply: “Particle storms can last a day or two. Crew should shelter.”`,
    ch: [
      {
        l: `Shelter inside for 2 sols`,
        s: `No outdoor research while sheltering. Costs 4 power.`,
        f() {
          S.storm = 2;
          S.mode = "shelter";
          S.power -= 4;
          return `The crew moved into the shielded shelter.`;
        },
        sci: `Shelter costs science time but keeps radiation low. Scientists say rock cliffs and lava tubes could add extra shielding on Mars.`,
      },
      {
        l: `Keep working outside`,
        s: `Research +12 per sol, but 30 simulated radiation units per sol.`,
        f() {
          S.storm = 2;
          S.mode = "work";
          return `The crew kept working outside.`;
        },
        sci: `More science now, but radiation doses add up over a mission. This is a real risk trade-off for astronauts.`,
      },
    ],
  },
  18: {
    t: `Water leak in the habitat!`,
    b: `A pipe is leaking. Water is dripping into the floor drain.`,
    earth: `Earth reply: “Fix leaks right away. Water is life.”`,
    ch: [
      {
        l: `Patch the leak now`,
        s: `Costs 10 power and 5 life support.`,
        f() {
          S.power -= 10;
          S.life -= 5;
          return `You sealed the pipe.`;
        },
        sci: `Repairs cost time and energy, but small leaks left alone become big problems.`,
      },
      {
        l: `Ignore it for now`,
        s: `Lose 20 life support now and 5 more each sol for 3 sols.`,
        f() {
          S.life -= 20;
          S.leak = 3;
          return `The leak kept dripping.`;
        },
        sci: `Delaying a repair can cost far more than doing it right away.`,
      },
    ],
  },
  22: {
    t: `The greenhouse plants are sick!`,
    b: `A blight has hit the crops. Every crop still growing is lost.`,
    earth: `Earth reply: “Replant with spare seeds and check your soil.”`,
    ch: [
      {
        l: `Replant with spare seeds`,
        s: `Costs 6 life support (water). New crop in 4 sols.`,
        f() {
          S.crops = [S.sol + 4];
          S.life -= 6;
          return `You replanted. New seedlings are on the way.`;
        },
        sci: `Growing food means managing risk. Spare seeds are like a backup plan.`,
      },
      {
        l: `Eat from the stores instead`,
        s: `No more crops from this batch.`,
        f() {
          S.crops = [];
          return `You gave up on this batch.`;
        },
        sci: `Stored food is safe but it runs out. Mars crews can’t just buy more.`,
      },
    ],
  },
  25: {
    t: `Ice discovered under the rocks!`,
    b: `Your scanner found ice. Digging for a sample is a big research chance.`,
    earth: `Earth reply: “Great find! Sample carefully.”`,
    ch: [
      {
        l: `Drill for an ice sample`,
        s: `Costs 15 power. Research +20.`,
        f() {
          S.power -= 15;
          S.research += 20;
          return `You drilled and brought back ice!`;
        },
        sci: `Ice could be melted for water and air. Finding it is a big deal for future Mars bases.`,
      },
      {
        l: `Save power instead`,
        s: `Keep your energy for life support.`,
        f() {
          return `You marked the spot to visit later.`;
        },
        sci: `Good planners know when a chance isn’t worth the risk.`,
      },
    ],
  },
};
