import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { locationName, temp, conditions, forecast } = body;

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === "gsk_your_key_here") {
      // Premium mock Groq response if key is not configured
      const mockResult = {
        summary: `Today in ${locationName || "your location"}, the weather is currently ${conditions || "clear"} at ${temp || 20}°C. The conditions are pleasant and suitable for outdoor plans.`,
        prediction: `Over the next few days, expect stable conditions with temperatures averaging ${temp || 20}°C. A slight increase in cloud cover is predicted towards the weekend.`,
        tips: `Stay hydrated throughout the afternoon. A light jacket is recommended if you are planning to stay out late in the evening.`
      };
      return NextResponse.json(mockResult);
    }

    // Call Groq API using Llama-3.1 model
    const systemPrompt = `You are a helpful meteorology assistant. Analyze the weather data provided and generate a structured JSON response with the following keys:
- "summary": A conversational 1-2 sentence overview of the current weather.
- "prediction": A brief analysis of weather trends for the upcoming week based on the forecast.
- "tips": 2 simple, practical tips for daily planning.
Return ONLY a valid JSON object, no other text.`;

    const userPrompt = `Location: ${locationName}
Current Temperature: ${temp}°C
Conditions: ${conditions}
Upcoming Forecast Days: ${JSON.stringify(forecast)}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Groq generation failed, returning fallback:", error);
    return NextResponse.json({
      summary: "Weather summaries are temporarily unavailable due to connectivity issues.",
      prediction: "Please check back in a few moments for updated forecast trend predictions.",
      tips: "Stay prepared for sudden weather changes by checking the live dashboard logs."
    });
  }
}
