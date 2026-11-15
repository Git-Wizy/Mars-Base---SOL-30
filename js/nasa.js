/* NASA: tries to load a recent strong flare live from NASA DONKI. If anything fails, the saved record in data.js is used. */
/* Free key from https://api.nasa.gov. It is visible to site visitors. Make a new one if it is ever abused. */
const NASA_KEY = "whRjT9F67PCHjrjRjrPCDCzCfM97wPhgd9qJr8KK";
async function loadDonki() {
  try {
    const e = new Date(),
      s = new Date(e - 30 * 864e5),
      f = (d) => d.toISOString().slice(0, 10);
    const r = await fetch(
      `https://api.nasa.gov/DONKI/FLR?startDate=${f(s)}&endDate=${f(e)}&api_key=${NASA_KEY}`,
    );
    if (!r.ok) return;
    const a = await r.json(),
      rk = (c) => "BCMX".indexOf(c[0]) * 100 + parseFloat(c.slice(1));
    const b = (Array.isArray(a) ? a : [])
      .filter((x) => x.classType && x.link && x.flrID && x.beginTime)
      .sort((p, q) => rk(q.classType) - rk(p.classType))[0];
    if (b && rk(b.classType) >= 200)
      Object.assign(DONKI, {
        id: b.flrID,
        cls: b.classType,
        date: f(new Date(b.beginTime)),
        region: b.activeRegionNum
          ? "Active Region " + b.activeRegionNum
          : "an unnamed region",
        link: b.link,
        live: true,
      });
  } catch (e) {}
}
loadDonki();
