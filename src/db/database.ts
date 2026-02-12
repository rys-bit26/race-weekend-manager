import Dexie, { type Table } from 'dexie';
import type { RaceWeekend, MasterScheduleEvent } from '../types/schedule';
import type { Activity, Person } from '../types/activity';

export class ScheduleDatabase extends Dexie {
  raceWeekends!: Table<RaceWeekend>;
  masterEvents!: Table<MasterScheduleEvent>;
  activities!: Table<Activity>;
  people!: Table<Person>;

  constructor() {
    super('RaceWeekendSchedule');

    this.version(1).stores({
      raceWeekends: 'id, name, startDate',
      masterEvents: 'id, weekendId, day, startTime, series',
      activities: 'id, weekendId, day, startTime, status, *departmentIds, *personIds',
      people: 'id, departmentId, name',
    });

    // v2: re-seed with real names and new departments
    this.version(2).stores({
      raceWeekends: 'id, name, startDate',
      masterEvents: 'id, weekendId, day, startTime, series',
      activities: 'id, weekendId, day, startTime, status, *departmentIds, *personIds',
      people: 'id, departmentId, name',
    }).upgrade(async (tx) => {
      await tx.table('raceWeekends').clear();
      await tx.table('masterEvents').clear();
      await tx.table('activities').clear();
      await tx.table('people').clear();
    });
  }
}

export const db = new ScheduleDatabase();
