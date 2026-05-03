import fs from 'node:fs/promises'
import path from 'node:path'

export async function readLegalMdx(slug: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'content', 'legal', `${slug}.mdx`)
  return fs.readFile(filePath, 'utf-8')
}
