"""
Генерирует новые фразы на основе загруженных строк через GPT-4o.
Комбинирует и перефразирует переданные фразы, сохраняя их стиль.
"""

import json
import os
import urllib.request
import urllib.error
import random


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}

    body = json.loads(event.get("body") or "{}")
    phrases: list = body.get("phrases", [])
    count: int = min(int(body.get("count", 10)), 50)
    prompt_extra: str = body.get("prompt", "")

    if not phrases:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Нет фраз для обработки"})}

    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        return {"statusCode": 500, "headers": cors_headers, "body": json.dumps({"error": "API-ключ не настроен"})}

    sample = random.sample(phrases, min(len(phrases), 30))
    sample_text = "\n".join(f"- {p}" for p in sample)

    user_instruction = f"Дополнительное условие: {prompt_extra}\n\n" if prompt_extra.strip() else ""

    system_prompt = (
        "Ты генератор текстовых фраз. Тебе дают список фраз-образцов. "
        "Твоя задача — создать новые фразы, комбинируя и перефразируя исходные. "
        "Сохраняй стиль, тематику и длину оригинальных фраз. "
        "Возвращай ТОЛЬКО список фраз — по одной на строку, без нумерации, без пояснений, без лишних символов."
    )

    user_prompt = (
        f"{user_instruction}"
        f"Вот примеры фраз:\n{sample_text}\n\n"
        f"Создай ровно {count} новых фраз в том же стиле. "
        f"Каждая фраза — с новой строки. Никакой нумерации."
    )

    payload = json.dumps({
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.9,
        "max_tokens": 2000,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        data = json.loads(resp.read())

    raw = data["choices"][0]["message"]["content"].strip()
    result_lines = [l.strip() for l in raw.split("\n") if l.strip()]

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"lines": result_lines, "count": len(result_lines)}),
    }
