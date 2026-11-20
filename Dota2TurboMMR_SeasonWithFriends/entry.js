export async function findAvailableServer(servers, request = fetch) {
  for (const server of servers) {
    try {
      const response = await request(new URL('/health', server), {
        cache: 'no-store', credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(3000)
      })
      if (response.ok && (await response.json()).status === 'ok') return server
    } catch {
      // The next origin may still be reachable from this browser.
    }
  }
  return null
}

if (typeof document !== 'undefined') {
  const servers = [...document.querySelectorAll('[data-server]')].map(link => link.href)
  const status = document.getElementById('status')
  const retry = document.getElementById('retry')
  async function openLeague() {
    retry.hidden = true
    status.textContent = 'Проверяем доступность серверов…'
    const server = await findAvailableServer(servers)
    if (server) return window.location.replace(server)
    status.textContent = 'Оба сервера сейчас недоступны. Попробуй ещё раз.'
    retry.hidden = false
  }
  retry.addEventListener('click', openLeague)
  void openLeague()
}
