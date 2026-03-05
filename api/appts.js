const { kv } = require("@vercel/kv");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { agent } = req.query;
  if (!agent) return res.status(400).json({ error: "agent required" });

  const key = `appts:${agent.toLowerCase()}`;

  try {
    if (req.method === "GET") {
      const data = await kv.get(key);
      return res.status(200).json(data || []);
    }

    if (req.method === "POST") {
      const { appts } = req.body;
      await kv.set(key, appts);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Appts API error:", error);
    return res.status(500).json({ error: error.message });
  }
};
