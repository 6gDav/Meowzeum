export default function Expetion() {
  if (typeof window !== 'undefined' 
    && new URLSearchParams(window.location.search).get('triggerError') === 'true') {
    throw new Error('Test error occured on the server')
  }
}
