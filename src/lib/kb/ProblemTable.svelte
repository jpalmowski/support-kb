<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsIn, type Problem } from '#lib/kb/problems';

  // `tickets` maps each problem to the issue that now carries it.
  let { ticket, tickets, labels }: { ticket: number; tickets: Partial<Record<Problem, string>>; labels: Partial<Record<Problem, string>> } =
    $props();

  const result = $derived(problemsIn(ticket, reports as Report[], tenantOf, notes.oneDayMove));
  const placed = $derived(result.groups.reduce((n, g) => n + g.reports.length, 0));
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{result.merged}</strong> reports merged into #{ticket} ·
  <strong>{result.groups.length}</strong>
  {result.groups.length === 1 ? 'problem' : 'problems'}
  {#if placed !== result.merged}<span class="off"> · {result.merged - placed} not placed</span>{/if}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>channels</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each result.groups as g (g.problem)}
      <tr>
        <td>{labels[g.problem] ?? g.problem}</td>
        <td><strong>{g.reports.length}</strong></td>
        <td class="muted">{channels(g.channels)}</td>
        <td>{g.tenants}</td>
        <td class="muted">{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if tickets[g.problem]}<a href={tickets[g.problem]}>{tickets[g.problem]?.replace(/^.*\/issues\//, 'issue #')}</a>{:else}<span class="off">none</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
  .off { color: var(--warn); font-weight: 600; }
</style>
