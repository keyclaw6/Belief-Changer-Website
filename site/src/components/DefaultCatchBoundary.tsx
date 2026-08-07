import {
  ErrorComponent,
  type ErrorComponentProps,
} from '@tanstack/react-router'

/**
 * DefaultCatchBoundary: the router's default error boundary. Kept intentionally
 * plain for Milestone 1; a fully styled, locale-aware error surface can be added
 * later. In development it shows the underlying error via the router's
 * ErrorComponent so problems are visible during the build-out.
 */
export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  return (
    <main className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-24">
      <h1
        className="text-ink"
        style={{
          fontSize: 'var(--text-headline-md)',
          fontWeight: 'var(--text-headline-md--font-weight)',
          lineHeight: 'var(--text-headline-md--line-height)',
        }}
      >
        Something went wrong.
      </h1>
      <div className="mt-6 overflow-auto rounded-md border border-hairline bg-surface p-4">
        <ErrorComponent error={error} />
      </div>
    </main>
  )
}
