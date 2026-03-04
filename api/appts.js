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
        SELECT * FROM appointments
        WHERE agent = ${agentKey}
        ORDER BY date DESC, start_time ASC
      `;
      // Convert DB rows to the frontend format
      const appts = rows.map(row => ({
        id: row.id,
        title: row.title,
        type: row.type,
        date: row.date,
        startTime: row.start_time,
        endTime: row.end_time,
        notes: row.notes || "",
        linkedLeadId: row.linked_lead_id || ""
      }));
      return res.status(200).json(appts);
    }

    if (req.method === "POST") {
      const { appts } = req.body;

      // Delete existing appointments for this agent and insert new ones
      await sql`DELETE FROM appointments WHERE agent = ${agentKey}`;

      for (const appt of appts) {
        await sql`
          INSERT INTO appointments (id, agent, title, type, date, start_time, end_time, notes, linked_lead_id)
          VALUES (${appt.id}, ${agentKey}, ${appt.title}, ${appt.type}, ${appt.date}, ${appt.startTime}, ${appt.endTime}, ${appt.notes || null}, ${appt.linkedLeadId || null})
        `;
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Appointments API error:", error);
    return res.status(500).json({ error: error.message });
  }
}
