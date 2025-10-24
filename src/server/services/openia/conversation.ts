import { Appointment, ServiceType } from "@prisma/client";
import { openai } from "./index";

type Intent = "eager" | "hesitant" | "decline";

function pickIntent(): Intent {
  const r = Math.random();
  if (r < 0.4) return "eager";
  if (r < 0.8) return "hesitant";
  return "decline";
}

export async function simulateCustomerReply(
  customerName: string,
  vehicle: string,
  conversationHistory: string,
) {
  const intent = pickIntent();

  const system = `
You are simulating a realistic customer reply to a car dealership’s service reminder.
INTENT: ${intent}

STYLE:
- 2–4 sentences max. No signatures.
- Casual, natural, quick. Not corporate.
- Occasional light typos (e.g., “thnks”, “ur”). Don’t overdo it.

BEHAVIOR:
- If INTENT=eager: propose a concrete time or ask for the next available slot.
- If INTENT=hesitant: ask 1–2 practical questions (price? time? Saturday? online booking? discounts? necessary now?).
- If INTENT=decline: politely pass or say you’ll wait; optionally ask 1 clarifying question.

EXTRAS (sprinkle sometimes):
- Mention being busy, budget, or “car seems fine”.
- Questions end with “?” sometimes.
`.trim();

  const user = `
CUSTOMER CONTEXT:
- Name: ${customerName}
- Vehicle: ${vehicle}

CONVERSATION HISTORY:
${conversationHistory}

TASK:
Reply as ${customerName} to the dealership’s last email above.
`.trim();

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.9,
    max_tokens: 80,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    stop: ["\n\n"],
  });

  return resp.choices[0]?.message?.content?.trim() ?? "Thanks!";
}

export async function simulateAgentReply(
  customerName: string,
  vehicle: string,
  serviceType: ServiceType,
  conversationHistory: string,
  appointment?: Appointment,
) {
  const isFollowUp = conversationHistory.split('\n').filter(line => line.startsWith('dealer:')).length > 1;
  
  const appointmentSection = appointment
    ? `
APPOINTMENT CONFIRMED:
- Date and Time: ${appointment.startsAt.toLocaleString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })}
- Service: ${appointment.service}

You MUST acknowledge this confirmed appointment in your response. Include the EXACT date, day of week, and time shown above. Be clear, enthusiastic, and match the time that was discussed in the conversation.
`
    : `
NO APPOINTMENT YET:
- If customer is asking about availability, suggest a specific day/time (be creative but realistic)
- If customer is asking questions, answer helpfully
- Keep it conversational and friendly
`;

  const greetingGuideline = isFollowUp
    ? `
CRITICAL - NO GREETINGS:
- This is a FOLLOW-UP message in an ongoing conversation
- DO NOT start with "Hi", "Hello", or any greeting
- Jump straight to answering/responding
- Example: "An oil change typically costs..." NOT "Hi Sarah! An oil change typically costs..."
`
    : `
FIRST CONTACT:
- This is the first dealer reply to the customer
- You may use a brief greeting if natural (e.g., "Hi Sarah!")
`;

  const system = `
You are a friendly, professional service advisor at Rally Auto Service dealership.

STYLE:
- Brief and conversational (2-4 sentences max)
- Professional but warm and approachable
- Use customer's first name occasionally (but not in greetings if this is a follow-up)
- No signature/sign-off needed

${greetingGuideline}

GUIDELINES:
- If suggesting times: Be specific (e.g., "Tuesday at 3pm" or "Friday morning around 10am")
- If confirming appointment: Include date, time, and service clearly
- If answering questions: Be helpful and knowledgeable
- Price ranges (if asked): Oil change ~$80-100, Tire rotation ~$50, Brake inspection ~$75-150
- Duration (if asked): Most services 45min-1.5hrs

${appointmentSection}

TONE: Helpful, efficient, friendly. Like texting a customer, not writing a formal email.
`.trim();

  const user = `
CONTEXT:
- Customer: ${customerName}
- Vehicle: ${vehicle}
- Service Type: ${serviceType}

CONVERSATION HISTORY:
${conversationHistory}

TASK:
Respond as the Rally Auto Service advisor to the customer's last message above.
`.trim();

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.8,
    max_tokens: 100,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    stop: ["\n\n"],
  });

  return (
    resp.choices[0]?.message?.content?.trim() ??
    "Thanks for reaching out! Let me check our schedule and get back to you."
  );
}
