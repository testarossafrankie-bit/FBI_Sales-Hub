const { kv } = require("@vercel/kv");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { agent } = req.query;
  if (!agent) return res.status(400).json({ error: "agent required" });

  const key = `dispositioned:${agent.toLowerCase()}`;

  try {
    if (req.method === "GET") {
      const data = await kv.get(key);
      // Filter out records older than 12 months
      if (Array.isArray(data)) {
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 12);
        const filtered = data.filter(d => new Date(d.dispositionedAt) >= cutoff);
        return res.status(200).json(filtered);
      }
      return res.status(200).json(data || []);
    }

    if (req.method === "POST") {
      const { dispositioned } = req.body;
      // Filter out records older than 12 months before saving
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 12);
      const filtered = (dispositioned || []).filter(d => new Date(d.dispositionedAt) >= cutoff);
      await kv.set(key, filtered);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Dispositioned API error:", error);
    return res.status(500).json({ error: error.message });
  }
};
