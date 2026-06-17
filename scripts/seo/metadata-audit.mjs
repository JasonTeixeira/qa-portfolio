#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = process.cwd()
const appDir = join(root, 'app')
const ignored = ['/api', '/admin', '/portal', '/auth']

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path))
    else if (entry.name === 'page.tsx') files.push(path)
  }
  return files
}

function routeFromFile(file) {
  const rel = relative(appDir, file).replaceAll('\\', '/')
  const route = `/${rel.replace(/\/page\.tsx$/, '').replace(/\/\(.*?\)/g, '')}`
  return route === '/page.tsx' || route === '/page' ? '/' : route
}

const files = await walk(appDir)
const rows = []

for (const file of files) {
  const route = routeFromFile(file)
  if (ignored.some((prefix) => route === prefix || route.startsWith(`${prefix}/`))) continue
  const source = await readFile(file, 'utf8')
  const hasGeneratedMetadata = /export\s+(async function|function)\s+generateMetadata\b/.test(source)
  const hasMetadataHelper = /legacyServiceAliasMetadata\(/.test(source)
  const hasMetadata =
    /export\s+const\s+metadata\b/.test(source) || hasGeneratedMetadata || hasMetadataHelper
  rows.push({
    route,
    file: relative(root, file),
    hasMetadata,
    hasTitle: hasGeneratedMetadata || hasMetadataHelper || /title\s*:/.test(source),
    hasDescription: hasGeneratedMetadata || hasMetadataHelper || /description\s*:/.test(source),
    hasCanonical: /canonical\s*:/.test(source),
    hasJsonLd: /<JsonLd\b|build[A-Z]\w+\(/.test(source),
  })
}

const missing = rows.filter((row) => !row.hasMetadata || !row.hasTitle || !row.hasDescription)
console.log(JSON.stringify({
  checked: rows.length,
  missingCritical: missing.length,
  missing,
}, null, 2))

if (missing.length > 0) process.exitCode = 1
