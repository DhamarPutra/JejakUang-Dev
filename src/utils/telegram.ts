
const BOT_TOKEN = "8240723407:AAFHhpL3NsA2X2C0t6-JzecoMsktN9vkAp0";
const CHAT_ID = "-1003760483968";

export async function sendFeedbackToTelegram(
  type: string,
  message: string
): Promise<boolean> {
  try {
    const text = `*New Feedback (${type})*\n\n${message}`;
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    // Using fetch to send POST request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: "Markdown",
      }),
    });

    if (!response.ok) {
        console.error("Telegram Error:", await response.text());
        return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send telegram message:", error);
    return false;
  }
}
