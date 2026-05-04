type Schema = Record<string, unknown>

/**
 * Server-rendered JSON-LD structured data.
 * Pass a single schema object or an array — each renders as its own <script>.
 */
export function JsonLd({ data }: { data: Schema | Schema[] }) {
  const items = Array.isArray(data) ? data : [data]
  return (
    <>
      {items.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
