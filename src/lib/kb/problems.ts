// The problems inside one merged ticket. causes.ts places a report by tenant and channel; the desk's
// notes (desk-notes.json) mark reports whose body shows a different bug: a one-day move, not a swap.
// Those leave their cause group and count as a problem of their own.
import { groupByCause, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

function summarise(problem: Problem, rs: Report[]): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: new Set(rs.map((r) => r.tenant)).size,
    channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function problemsIn(
  ticket: number,
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: number; groups: ProblemGroup[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  const rest = merged.filter((r) => !oneDayMove.includes(r.id));
  const groups = groupByCause(rest, tenantOf).map((g) => summarise(g.cause as Problem, g.reports));
  if (moved.length) groups.push(summarise('one-day', moved));
  return { merged: merged.length, groups: groups.sort((a, b) => b.reports.length - a.reports.length) };
}
