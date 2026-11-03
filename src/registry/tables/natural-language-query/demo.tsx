"use client";

import { NaturalLanguageQuery, type QueryColumn } from "./component";

interface Order {
  id: string;
  order_id: string;
  placed_at: string; // ISO date
  product: string;
  category: string;
  channel: string;
  total: number;
  status: string;
}

const ORDERS: Order[] = [
  { id: "1", order_id: "ORD-1000013", placed_at: "2026-10-30", product: "Standing desk", category: "Furniture", channel: "Web", total: 640, status: "Shipped" },
  { id: "2", order_id: "ORD-1000116", placed_at: "2026-10-30", product: "Noise-cancelling headset", category: "Electronics", channel: "Mobile app", total: 289, status: "Placed" },
  { id: "3", order_id: "ORD-1000201", placed_at: "2026-10-29", product: "4K monitor", category: "Electronics", channel: "Phone", total: 420, status: "Placed" },
  { id: "4", order_id: "ORD-1000187", placed_at: "2026-10-24", product: "Webcam", category: "Electronics", channel: "Web", total: 129, status: "Shipped" },
  { id: "5", order_id: "ORD-1000142", placed_at: "2026-10-18", product: "Ergonomic chair", category: "Furniture", channel: "Mobile app", total: 515, status: "Returned" },
  { id: "6", order_id: "ORD-1000098", placed_at: "2026-10-11", product: "Ring light", category: "Electronics", channel: "Mobile app", total: 59, status: "Shipped" },
  { id: "7", order_id: "ORD-1000077", placed_at: "2026-10-03", product: "Desk lamp", category: "Lighting", channel: "Web", total: 74, status: "Shipped" },
  { id: "8", order_id: "ORD-1000054", placed_at: "2026-09-27", product: "USB microphone", category: "Electronics", channel: "Web", total: 149, status: "Cancelled" },
  { id: "9", order_id: "ORD-1000031", placed_at: "2026-09-19", product: "Monitor arm", category: "Furniture", channel: "Phone", total: 112, status: "Shipped" },
  { id: "10", order_id: "ORD-1000012", placed_at: "2026-09-08", product: "Mechanical keyboard", category: "Electronics", channel: "Mobile app", total: 165, status: "Returned" },
];

const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const muted = (v: string) => <span className="text-muted-foreground">{v}</span>;

const COLUMNS: QueryColumn<Order>[] = [
  { key: "order_id", render: (r) => muted(r.order_id), className: "whitespace-nowrap" },
  { key: "placed_at", render: (r) => muted(date.format(new Date(r.placed_at))), className: "whitespace-nowrap" },
  { key: "product", className: "min-w-40" },
  { key: "channel", render: (r) => muted(r.channel), className: "whitespace-nowrap" },
  { key: "total", render: (r) => `$${r.total}`, className: "text-right tabular-nums" },
  {
    key: "status",
    render: (r) => <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{r.status}</span>,
  },
];

// ——— Mock translator: stands in for a model given the table schema. ———

async function translate(text: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 900));
  const t = text.toLowerCase();
  const where: string[] = [];

  // No column says "video call" — the model resolves it to concrete products.
  if (/video call|meeting|streaming/.test(t)) where.push("product IN ('Noise-cancelling headset', 'Webcam', 'Ring light', 'USB microphone')");
  else if (/electronic/.test(t)) where.push("category = 'Electronics'");
  else if (/furniture|desk|chair/.test(t)) where.push("category = 'Furniture'");

  if (/mobile|app\b/.test(t)) where.push("channel = 'Mobile app'");
  else if (/phone/.test(t)) where.push("channel = 'Phone'");
  else if (/\bweb\b|online|website/.test(t)) where.push("channel = 'Web'");

  if (/return/.test(t)) where.push("status = 'Returned'");
  else if (/not shipped|unshipped|pending|open/.test(t)) where.push("status = 'Placed'");
  else if (/shipped/.test(t)) where.push("status = 'Shipped'");
  else if (/cancel/.test(t)) where.push("status = 'Cancelled'");

  const over = t.match(/(?:over|above|more than|>)\s*\$?(\d+)/);
  if (over) where.push(`total > ${over[1]}`);
  const under = t.match(/(?:under|below|less than|<)\s*\$?(\d+)/);
  if (under) where.push(`total < ${under[1]}`);

  if (/this month|october|since oct/.test(t)) where.push("placed_at >= '2026-10-01'");
  else if (/last week|this week|recent/.test(t)) where.push("placed_at >= '2026-10-27'");
  else if (/september/.test(t)) where.push("placed_at BETWEEN '2026-09-01' AND '2026-09-30'");

  if (where.length === 0) throw new Error("No mapping");
  return where.join(" AND ");
}

// ——— Tiny WHERE-clause evaluator so the generated SQL actually runs. ———

type Value = string | number;
type Pred = (row: Order) => boolean;
// Every field in the schema is queryable, not only the displayed columns.
const KEYS = new Set(Object.keys(ORDERS[0]).filter((k) => k !== "id"));

function compile(where: string): Pred {
  const tokens = where.match(/'(?:[^']|'')*'|\d+(?:\.\d+)?|[A-Za-z_]\w*|>=|<=|<>|!=|[=<>(),]|\S/g) ?? [];
  let i = 0;
  const peek = () => tokens[i]?.toUpperCase();
  const next = () => tokens[i++];
  const expect = (t: string) => {
    if (peek() !== t) throw new Error(`Expected ${t} near "${tokens[i] ?? "end of query"}"`);
    i++;
  };
  const value = (): Value => {
    const t = next();
    if (t === undefined) throw new Error("Query ends too early");
    if (t.startsWith("'")) return t.slice(1, -1).replace(/''/g, "'");
    if (/^\d/.test(t)) return Number(t);
    throw new Error(`Expected a value, got "${t}"`);
  };

  function or(): Pred {
    let left = and();
    while (peek() === "OR") {
      next();
      const l = left, r = and();
      left = (row) => l(row) || r(row);
    }
    return left;
  }
  function and(): Pred {
    let left = not();
    while (peek() === "AND") {
      next();
      const l = left, r = not();
      left = (row) => l(row) && r(row);
    }
    return left;
  }
  function not(): Pred {
    if (peek() === "NOT") {
      next();
      const p = not();
      return (row) => !p(row);
    }
    return primary();
  }
  function primary(): Pred {
    if (peek() === "(") {
      next();
      const p = or();
      expect(")");
      return p;
    }
    const col = next();
    if (!col || !KEYS.has(col)) throw new Error(`Unknown column "${col ?? ""}" — try ${[...KEYS].join(", ")}`);
    const get = (row: Order) => row[col as keyof Order] as Value;
    let negate = false;
    if (peek() === "NOT") {
      next();
      negate = true;
    }
    const op = next()?.toUpperCase();
    let p: Pred;
    if (op === "IN") {
      expect("(");
      const list: Value[] = [value()];
      while (peek() === ",") {
        next();
        list.push(value());
      }
      expect(")");
      p = (row) => list.includes(get(row));
    } else if (op === "LIKE" || op === "ILIKE") {
      const pattern = String(value()).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".");
      const re = new RegExp(`^${pattern}$`, op === "ILIKE" ? "i" : "");
      p = (row) => re.test(String(get(row)));
    } else if (op === "BETWEEN") {
      const lo = value();
      expect("AND");
      const hi = value();
      p = (row) => get(row) >= lo && get(row) <= hi;
    } else {
      const v = value();
      const cmp: Record<string, (a: Value) => boolean> = {
        "=": (a) => a === v,
        "!=": (a) => a !== v,
        "<>": (a) => a !== v,
        ">": (a) => a > v,
        "<": (a) => a < v,
        ">=": (a) => a >= v,
        "<=": (a) => a <= v,
      };
      if (!op || !cmp[op]) throw new Error(`Unknown operator "${op ?? ""}"`);
      p = (row) => cmp[op](get(row));
    }
    return negate ? (row) => !p(row) : p;
  }

  const pred = or();
  if (i < tokens.length) throw new Error(`Unexpected "${tokens[i]}"`);
  return pred;
}

async function runQuery(where: string): Promise<Order[]> {
  await new Promise((r) => setTimeout(r, 250));
  const clause = where.replace(/^\s*(select\s+\*\s+from\s+\w+\s+)?where\s+/i, "");
  if (!clause) return ORDERS;
  return ORDERS.filter(compile(clause));
}

export default function NaturalLanguageQueryDemo() {
  return (
    <div className="w-full max-w-3xl">
      <NaturalLanguageQuery
        table="orders"
        columns={COLUMNS}
        onTranslate={translate}
        onRun={runQuery}
        initialRows={ORDERS}
        examples={["video call gear", "returned orders from the app", "electronics over $200 this month"]}
      />
    </div>
  );
}
