import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    // Create leads table
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(50) PRIMARY KEY,
        agent VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'New Lead',
        notes TEXT,
        prev_premium VARCHAR(50),
        quoted_premium VARCHAR(50),
        company VARCHAR(100),
        follow_up_date VARCHAR(20),
        follow_up_time VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index on agent for faster queries
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_agent ON leads(agent)`;

    // Create appointments table
    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(50) PRIMARY KEY,
        agent VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        date VARCHAR(20) NOT NULL,
        start_time VARCHAR(10),
        end_time VARCHAR(10),
        notes TEXT,
        linked_lead_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index on agent for faster queries
    await sql`CREATE INDEX IF NOT EXISTS idx_appointments_agent ON appointments(agent)`;

    return res.status(200).json({
      ok: true,
      message: "Database tables created successfully!",
      tables: ["leads", "appointments"]
    });
  } catch (error) {
    console.error("Setup error:", error);
    return res.status(500).json({ error: error.message });
  }
}
