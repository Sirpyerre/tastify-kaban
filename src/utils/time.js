export function nowUnix() {
  return Math.floor(Date.now() / 1000)
}

export function formatTimestamp(unixSeconds) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(unixSeconds * 1000))
}
