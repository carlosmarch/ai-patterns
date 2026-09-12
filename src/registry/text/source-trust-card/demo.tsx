import { SourceTrustCard, type TrustedSource } from "./component";

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

const SOURCES: TrustedSource[] = [
  {
    title: "Namecheap: Buy a domain name - Register…",
    domain: "namecheap.com",
    description:
      "Register domain names at Namecheap. Buy cheap domain names and enjoy 24/7 support. With over 18 million domains under management…",
    url: "https://www.namecheap.com",
    faviconUrl: favicon("namecheap.com"),
    trustReason: "is trusted for official domain registration, hosting, and web-services information from a U.S. provider.",
  },
  {
    title: "Cloudflare Registrar — At-cost domain registration",
    domain: "cloudflare.com",
    description:
      "Cloudflare Registrar offers at-cost domain registration with free WHOIS privacy and built-in DDoS protection for every domain.",
    url: "https://www.cloudflare.com/products/registrar/",
    faviconUrl: favicon("cloudflare.com"),
  },
];

export default function SourceTrustCardDemo() {
  return <SourceTrustCard sources={SOURCES} />;
}
