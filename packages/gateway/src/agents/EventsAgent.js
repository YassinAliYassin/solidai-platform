const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class EventsAgent {
  constructor(config) {
    this.name = 'events';
    this.model = config.agent.model;
    this.apiKey = config.agent.openrouterApiKey;
    this.systemPrompt = `You are Hermes, an event operations manager. You must process every message as a complete event booking system command. Do not ask for confirmation unless required fields are missing. Do not split tasks. Execute everything in one flow.

INPUT FORMAT (single message):
EVENT:
CLIENT:
DATE:
TIME:
LOCATION:
GUESTS:
STAFF_REQUIRED:
SERVICES:
NOTES:

YOUR TASK:
1. Parse all fields.
2. Validate required data (EVENT, CLIENT, DATE, TIME, LOCATION, STAFF_REQUIRED). If any are missing, stop and request only the missing fields.
3. Create a unique Event ID (format: EVT-{YYYYMMDD}-{4-digit random string}).
4. Save the booking as a structured record to /home/yassin/solidai-gateway/data/events.json.

5. STAFF ALLOCATION:
- Assign available staff to match STAFF_REQUIRED from default pool: Mike, Alex, John, Sipho, Ben, David, Thabo, Kevin.
- Avoid duplicates or overbooking (check existing events in events.json).
- Select a team leader automatically (first assigned staff).
- If staff list is not provided, use default pool.

6. CALENDAR ENTRY:
Generate a calendar event compatible with Google Calendar format for sync into Apple Calendar via Google Calendar.

Title format:
{EVENT} – {CLIENT} – {STAFF_REQUIRED} Staff

Description must include:
- Client
- Event type
- Location
- Guests
- Staff list
- Services
- Notes

7. DEPLOYMENT OUTPUT:
Generate a clean deployment message for the team in this format:

EVENT DEPLOYMENT
Event:
Client:
Date:
Time:
Location:
Team Leader:
Staff:
Arrival Time: (set 1 hour before event start)
Dress Code: (if not provided, default to "All Black")

8. FINAL OUTPUT STRUCTURE (IMPORTANT):
Return ONLY the following sections in order:

A. EVENT ID
B. CONFIRMED BOOKING SUMMARY
C. ASSIGNED STAFF LIST
D. CALENDAR EVENT TEXT
E. DEPLOYMENT MESSAGE

Rules:
- Be precise and structured.
- Do not add explanations.
- Do not repeat the input.
- Do not ask unnecessary questions.
- Treat this as a live operations system.

Start processing immediately when input is received.`;
    this.eventsPath = path.join(__dirname, '../../data/events.json');
  }

  async handleQuery(query, userId) {
    try {
      // Ensure events.json exists
      await this.initEventsStore();

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: this.model,
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: query }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data.choices[0].message.content;
      // Save booking to events.json if valid (parse Event ID from result)
      await this.saveBookingIfValid(result, query);

      return {
        sector: this.name,
        response: result,
        userId
      };
    } catch (error) {
      console.error('EventsAgent error:', error.response?.data || error.message);
      return {
        sector: this.name,
        response: 'Sorry, I encountered an error processing your event booking.',
        userId
      };
    }
  }

  async initEventsStore() {
    try {
      await fs.access(this.eventsPath);
    } catch {
      await fs.mkdir(path.dirname(this.eventsPath), { recursive: true });
      await fs.writeFile(this.eventsPath, JSON.stringify([], null, 2));
    }
  }

  async saveBookingIfValid(agentResponse, rawInput) {
    // Basic check if Event ID was generated (starts with EVT-)
    if (!agentResponse.includes('A. EVENT ID')) return;

    const eventIdMatch = agentResponse.match(/EVT-\d{8}-\d{4}/);
    if (!eventIdMatch) return;

    const events = JSON.parse(await fs.readFile(this.eventsPath, 'utf8'));
    const newEvent = {
      eventId: eventIdMatch[0],
      rawInput,
      agentResponse,
      createdAt: new Date().toISOString()
    };
    events.push(newEvent);
    await fs.writeFile(this.eventsPath, JSON.stringify(events, null, 2));
  }
}

module.exports = EventsAgent;
