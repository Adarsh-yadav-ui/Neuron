// chunker.ts
export function chunkText(input: string): string[] {
  // Pehle paragraph split karo
  const paragraphs = input
    .split("\n\n")
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 50);

  // Agar paragraphs nahi mile ya koi paragraph bahut bada hai
  const chunks: string[] = [];
  
  for (const para of paragraphs) {
    if (para.length <= 1000) {
      // Normal size — seedha add karo
      chunks.push(para);
    } else {
      // Bahut bada — sentence pe split karo
      const sentences = para.split(/(?<=[.!?])\s+/);
      let current = "";
      
      for (const sentence of sentences) {
        if ((current + sentence).length > 1000) {
          if (current) chunks.push(current.trim());
          current = sentence;
        } else {
          current += " " + sentence;
        }
      }
      if (current.trim().length > 50) chunks.push(current.trim());
    }
  }

  // Agar koi bhi chunk nahi bana — fallback to fixed size
  if (chunks.length === 0) {
    let start = 0;
    while (start < input.length) {
      const chunk = input.slice(start, start + 1000).trim();
      if (chunk.length > 50) chunks.push(chunk);
      start += 800; // 200 overlap
    }
  }

  return chunks;
}