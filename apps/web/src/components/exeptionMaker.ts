export default function Expetion() {
  if (import.meta.env.DEV
    && typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('triggerError') === 'true') {
    throw new Error('A test error occurred on the server!')
  }
}
