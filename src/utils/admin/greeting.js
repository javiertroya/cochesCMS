export function getGreeting(hour = new Date().getHours()) {
    if (hour >= 7 && hour < 14) return 'Buenos días'
    if (hour >= 14 && hour < 21) return 'Buenas tardes'
    return 'Buenas noches'
}

export function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
