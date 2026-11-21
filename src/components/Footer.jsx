import { FOOTER, LINKS } from '../content.js'
import PendingLink from './PendingLink.jsx'

export default function Footer() {
  return (
    <footer>
      <PendingLink href={LINKS.facebook} className="flink">Facebook</PendingLink>
      {' · '}
      <PendingLink href={LINKS.instagram} className="flink">Instagram</PendingLink>
      {' · '}
      {/* PENDING: replace with the newsletter sign-up form once the provider is chosen. */}
      <span className="newsletter">{FOOTER.newsletterPlaceholder}</span> {FOOTER.copyright}
    </footer>
  )
}
