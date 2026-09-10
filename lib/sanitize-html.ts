import { parseFragment, serialize, type DefaultTreeAdapterMap } from "parse5";

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "blockquote", "code", "pre", "hr", "span",
]);

const DROP_WITH_CONTENT = new Set([
  "script", "style", "iframe", "object", "embed", "svg", "math", "template",
]);

type HtmlAttribute = { name: string; value: string };
type HtmlNode = {
  nodeName: string;
  tagName?: string;
  attrs?: HtmlAttribute[];
  childNodes?: HtmlNode[];
};

function safeHref(value: string) {
  const href = value.trim();
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  if (href.startsWith("#")) return href;
  // Single-slash relative paths only — reject protocol-relative `//evil`.
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  return "";
}

function cleanAttributes(node: HtmlNode) {
  if (!node.attrs) return;
  const cleaned: HtmlAttribute[] = [];
  for (const attribute of node.attrs) {
    if (attribute.name === "class" && /^[a-z0-9 _-]*$/i.test(attribute.value)) cleaned.push(attribute);
    if (node.tagName === "a" && attribute.name === "href") {
      const href = safeHref(attribute.value);
      if (href) cleaned.push({ name: "href", value: href });
    }
    if (node.tagName === "a" && attribute.name === "target" && attribute.value === "_blank") cleaned.push(attribute);
  }
  if (node.tagName === "a" && cleaned.some((attribute) => attribute.name === "target")) cleaned.push({ name: "rel", value: "noopener noreferrer" });
  node.attrs = cleaned;
}

function sanitizeChildren(parent: HtmlNode) {
  const next: HtmlNode[] = [];
  for (const node of parent.childNodes ?? []) {
    if (!node.tagName) {
      next.push(node);
      continue;
    }
    if (DROP_WITH_CONTENT.has(node.tagName)) continue;
    sanitizeChildren(node);
    if (!ALLOWED_TAGS.has(node.tagName)) {
      next.push(...(node.childNodes ?? []));
      continue;
    }
    cleanAttributes(node);
    next.push(node);
  }
  parent.childNodes = next;
}

/** Sanitize TipTap HTML before save and again before public render. */
export function sanitizeBlogHtml(html: string): string {
  const fragment = parseFragment(html) as unknown as HtmlNode;
  sanitizeChildren(fragment);
  return serialize(fragment as unknown as DefaultTreeAdapterMap["parentNode"]);
}
