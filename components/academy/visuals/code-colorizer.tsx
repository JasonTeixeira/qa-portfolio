/**
 * code-colorizer — the light, synchronous syntax colorizer for
 * SageCodeWalkthrough. Extracted to keep the component file under the 800-line
 * cap. Emits real, selectable text (only color changes), so a11y/contrast is
 * unaffected. Supports the 3 walkthrough languages with zero added deps.
 */

import * as React from 'react'
import type { CodeWalkthroughLanguage } from './SageCodeWalkthrough'

type TokenClass = 'keyword' | 'string' | 'comment' | 'number' | 'fn' | 'plain'

// A deliberate 4–5 token scale on EXISTING --ac-* tokens, all AA-contrasting on
// the near-black code surface (--ac-bg, L≈15%). Two hues (accent-blue, success-
// green) + amber + two ink weights + faint comments — distinct, not a rainbow.
const TOKEN_COLOR: Record<TokenClass, string> = {
  // Keywords: accent hue AS TEXT (blue, L≈76%, AA on dark) — control flow.
  keyword: 'var(--ac-accent-text)',
  // Strings: the proven/success green reads as "literal value" (L≈78%).
  string: 'var(--ac-mastery)',
  // Function / method names called or defined: full-bright bone — the verbs.
  fn: 'var(--ac-ink)',
  // Numbers: the pending amber (L≈80%).
  number: 'var(--ac-pending)',
  // Comments: faint mono ink — recede on purpose (L≈64%, AA).
  comment: 'var(--ac-ink-faint)',
  // Everything else (identifiers, operators, punctuation): the dimmer ink weight
  // so the colored tokens above read as foreground (L≈80%, still AA ~7.5:1).
  plain: 'var(--ac-ink-soft)',
}

const KEYWORDS: Record<CodeWalkthroughLanguage, readonly string[]> = {
  python: [
    'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and',
    'or', 'import', 'from', 'as', 'class', 'with', 'try', 'except', 'finally',
    'raise', 'yield', 'lambda', 'pass', 'break', 'continue', 'None', 'True',
    'False', 'async', 'await', 'global', 'nonlocal', 'assert', 'del', 'is',
  ],
  ts: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'of', 'in', 'new', 'class', 'extends', 'implements', 'interface', 'type',
    'import', 'from', 'export', 'default', 'async', 'await', 'try', 'catch',
    'finally', 'throw', 'switch', 'case', 'break', 'continue', 'typeof',
    'instanceof', 'void', 'null', 'undefined', 'true', 'false', 'this', 'super',
    'public', 'private', 'protected', 'readonly', 'static', 'enum',
  ],
  bash: [
    'if', 'then', 'else', 'elif', 'fi', 'for', 'in', 'do', 'done', 'while',
    'case', 'esac', 'function', 'return', 'export', 'local', 'echo', 'cd',
    'set', 'source', 'exit', 'read', 'shift', 'unset', 'declare',
  ],
}

/**
 * A light, synchronous colorizer. Splits each line into ordered comment / string
 * / number / keyword / plain spans without a full parser — good enough for the
 * 3 supported languages and zero added deps. Real text is preserved (selectable);
 * only color changes, so a11y/contrast is unaffected.
 */
export function renderTokens(line: string, language: CodeWalkthroughLanguage): React.ReactNode {
  if (line.length === 0) return null

  const commentStart = language === 'bash' || language === 'python' ? '#' : '//'
  const commentIdx = findCommentIndex(line, commentStart)
  const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line
  const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : ''

  const nodes: React.ReactNode[] = []
  const keywords = new Set(KEYWORDS[language])

  // Tokenize the code part into strings / numbers / words / other, in order.
  const re =
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+|[^\sA-Za-z0-9_$"'`]+)/g
  let match: RegExpExecArray | null
  let key = 0
  while ((match = re.exec(codePart)) !== null) {
    const [, str, num, word, other] = match
    if (str !== undefined) {
      nodes.push(span(str, 'string', key++))
    } else if (num !== undefined) {
      nodes.push(span(num, 'number', key++))
    } else if (word !== undefined) {
      // A word followed (after optional space) by '(' reads as a function or
      // method call/definition — color it as the "verb" rather than plain.
      const cls = keywords.has(word)
        ? 'keyword'
        : isCallName(codePart, re.lastIndex)
          ? 'fn'
          : 'plain'
      nodes.push(span(word, cls, key++))
    } else if (other !== undefined) {
      nodes.push(span(other, 'plain', key++))
    }
  }

  if (commentPart) nodes.push(span(commentPart, 'comment', key++))
  return nodes
}

/** A word is a function/method name if the next non-space char is '('. */
function isCallName(code: string, fromIndex: number): boolean {
  let i = fromIndex
  while (i < code.length && (code[i] === ' ' || code[i] === '\t')) i += 1
  return code[i] === '('
}

function span(text: string, cls: TokenClass, key: number): React.ReactNode {
  if (cls === 'plain') return <React.Fragment key={key}>{text}</React.Fragment>
  return (
    <span key={key} style={{ color: TOKEN_COLOR[cls] }}>
      {text}
    </span>
  )
}

/** Find a comment marker that is not inside a string literal. */
function findCommentIndex(line: string, marker: string): number {
  let quote: string | null = null
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (quote) {
      if (ch === '\\') {
        i += 1
        continue
      }
      if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      continue
    }
    if (line.startsWith(marker, i)) return i
  }
  return -1
}
