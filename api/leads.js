import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { agent } = req.query;
  if (!agent) return res.status(400).json({ error: "agent required" });

  const agentKey = agent.toLowerCase();

  try {
    if (req.method === "GET") {
      const { rows } = await sql`
        SELECT * FROM leads
        WHERE agent = ${agentKey}
        ORDER BY created_at DESC
      `;
      // Convert DB rows to the frontend format
      const leads = rows.map(row => ({
        id: row.id,
        name: row.name,
        phone: row.phone || "",
        status: row.status,
        notes: row.notes || "",
        prevPremium: row.prev_premium || "",
        quotedPremium: row.quoted_premium || "",
        company: row.company || "",
        followUpDate: row.follow_up_date || "",
        followUpTime: row.follow_up_time || "09:00"
      }));
      return res.status(200).json(leads);
    }

    if (req.method === "POST") {
      const { leads } = req.body;

      // Delete existing leads for this agent and insert new ones
      await sql`DELETE FROM leads WHERE agent = ${agentKey}`;

      for (const lead of leads) {
        await sql`
          INSERT INTO leads (id, agent, name, phone, status, notes, prev_premium, quoted_premium, company, follow_up_date, follow_up_time)
          VALUES (${lead.id}, ${agentKey}, ${lead.name}, ${lead.phone || null}, ${lead.status}, ${lead.notes || null}, ${lead.prevPremium || null}, ${lead.quotedPremium || null}, ${lead.company || null}, ${lead.followUpDate || null}, ${lead.followUpTime || null})
        `;
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Leads API error:", error);
    return res.status(500).json({ error: error.message });
  }
}
