import { formatInTimeZone } from 'date-fns-tz'
import { formatDistanceToNow, parseISO } from 'date-fns'

export const TZ = 'Africa/Nairobi'

export const nairobiDate = (fmt = 'EEEE, MMMM d, yyyy') =>
  formatInTimeZone(new Date(), TZ, fmt)

export const nairobiTime = () =>
  formatInTimeZone(new Date(), TZ, 'HH:mm')

export const formatDate = (s: string, fmt = 'MMM d, yyyy') => {
  try { return formatInTimeZone(parseISO(s), TZ, fmt) } catch { return s }
}

export const timeAgo = (s: string) => {
  try { return formatDistanceToNow(parseISO(s), { addSuffix: true }) } catch { return '' }
}
