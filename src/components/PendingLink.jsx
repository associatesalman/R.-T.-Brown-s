// A link that looks the same as the reference while its real URL is pending.
// When the URL is null it does nothing and says so on hover and to screen readers.
export default function PendingLink({ href, className, style, children }) {
  if (href) {
    const external = /^https?:/i.test(href)
    return (
      <a className={className} style={style} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    )
  }
  return (
    <a
      className={className}
      style={style}
      href="#"
      aria-disabled="true"
      title="Link coming soon"
      data-pending=""
      onClick={(e) => e.preventDefault()}
    >
      {children}
    </a>
  )
}
