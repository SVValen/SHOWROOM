const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendMessage(
  chatId: string | number,
  text: string,
  reply_markup?: object
) {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...(reply_markup && { reply_markup }),
    }),
  })
  return res.json()
}

export async function sendPhoto(chatId: string | number, photoUrl: string, caption?: string) {
  const res = await fetch(`${TELEGRAM_API}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption }),
  })
  return res.json()
}

export async function answerCallbackQuery(id: string, text?: string) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: id, ...(text && { text }) }),
  })
}

export async function getFile(fileId: string): Promise<string | null> {
  const res = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`)
  const data = await res.json()
  if (!data.ok) return null
  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${data.result.file_path}`
}
