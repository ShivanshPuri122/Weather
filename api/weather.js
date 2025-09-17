// api/weather.js  (Vercel serverless handler)
// Deploys as: https://<your-site>/api/weather?city=Delhi

export default async function handler(req, res) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing API key on server." });
    return;
  }

  const city = (req.query.city || "").trim();
  if (!city) return res.status(400).json({ error: "Missing city query param." });

  try {
    // Current weather
    const curUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const curRes = await fetch(curUrl);
    const current = await curRes.json();

    // Forecast (5-day / 3-hour)
    const fUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const fRes = await fetch(fUrl);
    const forecast = await fRes.json();

    // If coord exists, fetch UV and AQI (if available)
    let uv = null;
    let aqi = null;
    if (current && current.coord) {
      const { lat, lon } = current.coord;

      // UV may be available for free via older endpoint; fallback to One Call if needed.
      try {
        const uvRes = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        if (uvRes.ok) uv = await uvRes.json();
      } catch (e) { /* ignore */ }

      try {
        const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        if (aqiRes.ok) aqi = await aqiRes.json();
      } catch (e) { /* ignore */ }
    }

    // Allow client cross-origin (optional, adjust for security)
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).json({ current, forecast, uv, aqi });
  } catch (err) {
    console.error("API error:", err);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({ error: err.message || "server error" });
  }
}
