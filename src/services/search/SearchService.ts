import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Activity, Person } from '../../types/activity';
import { DEPARTMENT_MAP } from '../../utils/constants';

interface EnrichedActivity extends Activity {
  _departmentNames: string;
  _personNames: string;
}

const fuseOptions: IFuseOptions<EnrichedActivity> = {
  keys: [
    { name: 'name', weight: 0.35 },
    { name: 'notes', weight: 0.15 },
    { name: 'location', weight: 0.2 },
    { name: '_departmentNames', weight: 0.15 },
    { name: '_personNames', weight: 0.15 },
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

export function searchActivities(
  activities: Activity[],
  people: Person[],
  query: string
): Activity[] {
  if (!query.trim()) return activities;

  const personMap = new Map(people.map((p) => [p.id, p.name]));

  const enriched: EnrichedActivity[] = activities.map((a) => ({
    ...a,
    _departmentNames: a.departmentIds.map((d) => DEPARTMENT_MAP[d]?.name ?? '').join(' '),
    _personNames: a.personIds.map((id) => personMap.get(id) ?? '').join(' '),
  }));

  const fuse = new Fuse(enriched, fuseOptions);
  const results = fuse.search(query);
  return results.map((r) => r.item);
}
