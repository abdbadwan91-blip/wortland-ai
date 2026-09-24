/** Small non-blocking toast — kid-friendly, auto-dismisses. */
export function showOtaToast(message: string): void {
  if (typeof document === 'undefined') return
  const existing = document.getElementById('wortland-ota-toast')
  if (existing) existing.remove()

  const el = document.createElement('div')
  el.id = 'wortland-ota-toast'
  el.setAttribute('role', 'status')
  el.textContent = message
  Object.assign(el.style, {
    position: 'fixed',
    left: '50%',
    bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
    transform: 'translateX(-50%)',
    zIndex: '99999',
    maxWidth: 'min(92vw, 360px)',
    padding: '10px 14px',
    borderRadius: '14px',
    background: 'rgba(20, 24, 40, 0.94)',
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: '800',
    lineHeight: '1.35',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,.35)',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 220ms ease',
  } as CSSStyleDeclaration)
  document.body.appendChild(el)
  requestAnimationFrame(() => {
    el.style.opacity = '1'
  })
  window.setTimeout(() => {
    el.style.opacity = '0'
    window.setTimeout(() => el.remove(), 280)
  }, 4200)
}
