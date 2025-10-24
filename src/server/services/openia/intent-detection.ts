import { openai } from "./index";

export enum Confidence {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export type BookingIntent = {
  hasIntent: boolean;
  confidence: Confidence;
  reasoning: string;
  startsAt?: string;
  endsAt?: string;
};

export async function detectBookingIntent(
  conversationHistory: string,
): Promise<BookingIntent> {
  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  });
  
  const prompt = `
Analyze this conversation to determine if an appointment should be created.

CURRENT DATE AND TIME: ${formattedCurrentDate}

CONVERSATION:
${conversationHistory}

CREATE AN APPOINTMENT ONLY IF ONE OF THE FOLLOWING IS TRUE (return "hasIntent": true with "confidence": "high"):

SCENARIO 1: Customer confirms dealer's suggested specific time
1) Dealership has already suggested a specific date AND time (e.g., "Tuesday at 3:00 PM")
2) The CUSTOMER'S MOST RECENT message clearly confirms that time
   Examples: "Yes, that works", "Perfect", "Sounds good", "See you then"

SCENARIO 2: Customer proposes a specific date AND time (hour required)
1) The CUSTOMER'S MOST RECENT message proposes a concrete time with an explicit hour
   Examples: "Saturday at 10 AM", "Tuesday at 3:00 PM", "Wednesday 9am", "Fri 2pm"
   Vague periods without an hour DO NOT count (e.g., "Thursday afternoon", "Friday morning")

EXPLICIT HOUR REQUIRED:
- Valid: day + explicit hour (with am/pm or 24h) → "Saturday at 10 AM", "Wed 14:30"
- Invalid: vague period only → "Thursday afternoon", "Friday morning", "next week"

NOT BOOKING INTENT (return false):
- Asking about general availability: "Do you have slots?", "What times are available?"
- Just showing interest: "I'd love to get that done" (no specific hour)
- Asking questions: "How much?", "How long will it take?"
- Being noncommittal: "Maybe", "Let me check", "I'll think about it"
- Backing out: "Actually I'll wait", "I'll pass for now"

IMPORTANT:
- If the customer's most recent message is vague (e.g., "Thursday afternoon"), return false (agent should suggest times instead)

If you conclude there IS booking intent with confidence high, also EXTRACT the precise appointment time range. Use the following rules:

EXTRACTION PROCESS:
1. Read through the conversation to find the most recent time that was agreed upon
2. If dealer suggested a time (e.g., "How about Saturday at 10am?") and customer confirmed (e.g., "That works!"), use the dealer's suggested time (10am)
3. If customer proposed a time (e.g., "Can I come Saturday at 2pm?"), use the customer's proposed time (2pm)
4. DO NOT invent or change times - use the EXACT hour and time that was mentioned

FORMATTING:
- Parse natural language times and convert to ISO-8601 in the dealership's local time (America/New_York timezone)
- Use the CURRENT DATE AND TIME provided above to calculate relative dates
- When "this Saturday" or "next Tuesday" is mentioned, calculate from the CURRENT DATE (not from any arbitrary date)
- ALL appointments MUST be in the FUTURE relative to the CURRENT DATE AND TIME provided above
- If duration is not stated, assume 1 hour
- If only a start time is provided, set endsAt to start time + 1 hour

EXAMPLE:
Current Date: Wednesday, October 23, 2025 at 10:30 PM
Conversation: "dealer: How about this Saturday at 10am? customer: Sounds great!"
→ startsAt should be Saturday, October 26, 2025 at 10:00 AM (the NEXT Saturday after Oct 23, NOT any past date)

Respond with ONLY valid JSON:
{
  "hasIntent": true or false,
  "confidence": "high" or "medium" or "low",
  "reasoning": "brief explanation",
  "startsAt": ISO-8601 string or null,
  "endsAt": ISO-8601 string or null
}
`.trim();

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 100,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const content = resp.choices[0]?.message?.content;
    if (!content) {
      return {
        hasIntent: false,
        confidence: Confidence.LOW,
        reasoning: "No response from AI",
      };
    }

    const parsed = JSON.parse(content) as Partial<BookingIntent>;

    const result: BookingIntent = {
      hasIntent: Boolean(parsed.hasIntent),
      confidence: parsed.confidence || Confidence.LOW,
      reasoning: parsed.reasoning ?? "",
      startsAt: parsed.startsAt ?? undefined,
      endsAt: parsed.endsAt ?? undefined,
    };

    return result;
  } catch (error) {
    console.error("Error detecting booking intent:", error);
    return {
      hasIntent: false,
      confidence: Confidence.LOW,
      reasoning: "Error analyzing intent",
    };
  }
}
