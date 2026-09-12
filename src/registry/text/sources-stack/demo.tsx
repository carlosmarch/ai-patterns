import { SourcesStack, type Source } from "./component";

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

const SOURCES: Source[] = [
  {
    title: "Creative Commons — About The Licenses",
    domain: "creativecommons.org",
    url: "https://creativecommons.org/licenses/",
    faviconUrl: favicon("creativecommons.org"),
  },
  {
    title: "PostgreSQL: Documentation",
    domain: "postgresql.org",
    url: "https://www.postgresql.org/docs/",
    faviconUrl: favicon("postgresql.org"),
  },
  {
    title: "OWASP Top Ten",
    domain: "owasp.org",
    url: "https://owasp.org/www-project-top-ten/",
    faviconUrl: favicon("owasp.org"),
  },
  {
    title: "MDN Web Docs",
    domain: "developer.mozilla.org",
    url: "https://developer.mozilla.org/",
    faviconUrl: favicon("developer.mozilla.org"),
  },
  {
    title: "Node.js Documentation",
    domain: "nodejs.org",
    url: "https://nodejs.org/en/docs",
    faviconUrl: favicon("nodejs.org"),
  },
  {
    title: "React Docs — Thinking in React",
    domain: "react.dev",
    url: "https://react.dev/learn/thinking-in-react",
    faviconUrl: favicon("react.dev"),
  },
  {
    title: "RFC 9110: HTTP Semantics",
    domain: "rfc-editor.org",
    url: "https://www.rfc-editor.org/rfc/rfc9110",
    faviconUrl: favicon("rfc-editor.org"),
  },
];

export default function SourcesStackDemo() {
  return <SourcesStack sources={SOURCES} />;
}
