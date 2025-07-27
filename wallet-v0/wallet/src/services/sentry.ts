import { init, ErrorBoundary, captureException } from '@sentry/react'
import packageJson from '../../package.json'

init({
  release: `safe-wallet-web@${packageJson.version}`,
  sampleRate: 0.1,
  // ignore MetaMask errors we don't control
  ignoreErrors: ['Internal JSON-RPC error', 'JsonRpcEngine', 'Non-Error promise rejection captured with keys: code'],

  beforeSend: (event) => {
    // Remove sensitive URL query params
    const query = event.request?.query_string
    if (event.request && query) {
      const appUrl = typeof query !== 'string' && !Array.isArray(query) ? query.appUrl : ''
      if (appUrl) {
        event.request.query_string = { appUrl }
      } else {
        delete event.request.query_string
      }
    }
    return event
  },
})

export const SentryErrorBoundary = ErrorBoundary
export const sentryCaptureException = captureException
