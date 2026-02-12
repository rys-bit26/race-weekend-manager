import { db } from './database';
import { generateId } from '../utils/id';
import type { RaceWeekend, MasterScheduleEvent } from '../types/schedule';
import type { Activity, Person, DepartmentId } from '../types/activity';

const WEEKEND_ID = 'seed-weekend-stpete-2026';

const seedWeekend: RaceWeekend = {
  id: WEEKEND_ID,
  name: 'Streets of St. Petersburg 2026',
  trackName: 'Streets of St. Petersburg',
  location: 'St. Petersburg, FL',
  startDate: '2026-02-25',
  endDate: '2026-03-01',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const seedPeople: Person[] = [
  // Content
  { id: generateId(), name: 'Mark Grainda', departmentId: 'social-content', role: 'Content Director' },
  { id: generateId(), name: 'Alex Frick', departmentId: 'social-content', role: 'Videographer' },
  { id: generateId(), name: 'Kylie Wagner', departmentId: 'social-content', role: 'Social Media Manager' },
  { id: generateId(), name: 'Devin Welch', departmentId: 'social-content', role: 'Content Creator' },
  { id: generateId(), name: 'Ryan Sawrie', departmentId: 'social-content', role: 'Content Creator' },
  // Partnerships
  { id: generateId(), name: 'Matt Kennedy', departmentId: 'partnerships', role: 'Partnerships Director' },
  { id: generateId(), name: 'Eric', departmentId: 'partnerships', role: 'Partner Manager' },
  { id: generateId(), name: 'Dan Savka', departmentId: 'partnerships', role: 'Partner Manager' },
  { id: generateId(), name: 'Elizabeth Wood', departmentId: 'partnerships', role: 'Activation Manager' },
  { id: generateId(), name: 'Tanner Higgins', departmentId: 'partnerships', role: 'Coordinator' },
  // Brand Experiences
  { id: generateId(), name: 'Stephanie Heinz', departmentId: 'brand-experiences', role: 'BX Director' },
  { id: generateId(), name: 'Richie Best', departmentId: 'brand-experiences', role: 'Event Manager' },
  { id: generateId(), name: 'Alex Sevening', departmentId: 'brand-experiences', role: 'Activation Specialist' },
  { id: generateId(), name: 'Tyler Martin', departmentId: 'brand-experiences', role: 'Fan Engagement' },
  // Sales
  { id: generateId(), name: 'Kyle Moeller', departmentId: 'sales', role: 'Sales Director' },
  // Drivers
  { id: generateId(), name: 'Will Power', departmentId: 'drivers', role: 'Driver' },
  { id: generateId(), name: 'Kyle Kirkwood', departmentId: 'drivers', role: 'Driver' },
  { id: generateId(), name: 'Marcus Ericsson', departmentId: 'drivers', role: 'Driver' },
  // Photography
  { id: generateId(), name: 'Stillhouse', departmentId: 'photography', role: 'Photography' },
  // Executives
  { id: generateId(), name: 'Mark Myers', departmentId: 'executives', role: 'Executive' },
  { id: generateId(), name: 'Jill Gregory', departmentId: 'executives', role: 'Executive' },
  { id: generateId(), name: 'Dan Towriss', departmentId: 'executives', role: 'Executive' },
];

const seedMasterEvents: MasterScheduleEvent[] = [
  // Thursday
  { id: generateId(), weekendId: WEEKEND_ID, day: 'thursday', startTime: '08:00', endTime: '11:30', title: 'Setup', series: 'GENERAL', rawText: '8:00-11:30 Setup (3 hours 30 mins)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'thursday', startTime: '11:00', endTime: '17:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '11:00-5:00 PM Media Center Hours', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'thursday', startTime: '12:00', endTime: '18:00', title: 'NICS Garage Open - All Crew', series: 'INDYCAR', rawText: '12:00-6:00 PM NICS Garage, All Crew', confidence: 1 },
  // Friday
  { id: generateId(), weekendId: WEEKEND_ID, day: 'friday', startTime: '07:00', endTime: '20:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '7:00-8:00 PM Media Center Hours', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'friday', startTime: '06:30', endTime: '08:00', title: 'Track Inspection', series: 'GENERAL', rawText: '6:30-8:00 Track Inspection Slow! (90)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'friday', startTime: '08:00', endTime: '08:35', title: 'USF2000 Practice', series: 'USF2000', rawText: '8:00-8:35 USF2000 Practice (35)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'friday', startTime: '08:55', endTime: '09:40', title: 'MX-5 Cup Practice', series: 'MX5_CUP', rawText: '8:55-9:40 MX-5 Cup Practice (45)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'friday', startTime: '10:00', endTime: '10:30', title: 'USF2000 Qualifying', series: 'USF2000', rawText: '10:00-10:30 USF2000 Qualifying (30)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'friday', startTime: '10:50', endTime: '11:10', title: 'MX-5 Cup Qualifying', series: 'MX5_CUP', rawText: '10:50-11:10 MX-5 Cup Qualifying (20)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'friday', startTime: '11:30', endTime: '12:10', title: 'USF2000 Race 1', series: 'USF2000', rawText: '11:30-12:10 USF2000 Race 1 (40)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'friday', startTime: '12:30', endTime: '13:15', title: 'INDY NXT Practice 1', series: 'INDY_NXT', rawText: '12:30-1:15 INDY NXT Practice 1 (45)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'friday', startTime: '13:35', endTime: '15:00', title: 'NTT INDYCAR SERIES Practice 1 - Groups', series: 'INDYCAR', rawText: '1:35-3:00 NTT INDYCAR SERIES Practice 1 - Groups (40/12/12)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'friday', startTime: '16:00', endTime: '16:50', title: 'NCTS Practice', series: 'NCTS', rawText: '4:00-4:50 NCTS Practice (50)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'friday', startTime: '17:05', endTime: '18:00', title: 'NCTS Qualifying', series: 'NCTS', rawText: '5:05-6:00 NCTS Qualifying (55)', confidence: 1 },
  // Saturday
  { id: generateId(), weekendId: WEEKEND_ID, day: 'saturday', startTime: '07:00', endTime: '21:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '7:00-9:00 PM Media Center Hours', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'saturday', startTime: '06:30', endTime: '07:30', title: 'Track Inspection', series: 'GENERAL', rawText: '6:30-7:30 Track Inspection Slow! (60)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'saturday', startTime: '07:30', endTime: '08:15', title: 'MX-5 Cup Race #1', series: 'MX5_CUP', rawText: '7:30-8:15 MX-5 Cup Race #1 (40)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'saturday', startTime: '08:35', endTime: '09:15', title: 'INDY NXT Practice 2', series: 'INDY_NXT', rawText: '8:35-9:15 INDY NXT Practice 2 (40)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'saturday', startTime: '09:35', endTime: '11:00', title: 'NTT INDYCAR SERIES Practice 2 - Groups', series: 'INDYCAR', rawText: '9:35-11:00 NTT INDYCAR SERIES Practice 2 - Groups (40/12/12)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'saturday', startTime: '12:00', endTime: '12:00', title: 'NCTS Race', series: 'NCTS', rawText: '? 12:00 NCTS Race 80 Laps', confidence: 0.8 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'saturday', startTime: '15:45', endTime: '16:15', title: 'INDY NXT Qualifying', series: 'INDY_NXT', rawText: '3:45-4:15 INDY NXT Q (30)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'saturday', startTime: '16:35', endTime: '18:00', title: 'NTT INDYCAR SERIES Qualifications', series: 'INDYCAR', rawText: '4:35-6:00 NTT INDYCAR SERIES Qualifications', confidence: 1 },
  // Sunday
  { id: generateId(), weekendId: WEEKEND_ID, day: 'sunday', startTime: '06:30', endTime: '07:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '6:30-7:00 PM Media Center Hours', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'sunday', startTime: '06:30', endTime: '07:45', title: 'Track Inspection', series: 'GENERAL', rawText: '6:30-7:45 Track Inspection Slow! (75)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'sunday', startTime: '07:45', endTime: '08:45', title: 'Alt. 2 Seater, Event Cars', series: 'SUPPORT', rawText: '7:45-8:45, Alt. 2 Seater, Event Cars (60)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'sunday', startTime: '09:05', endTime: '09:35', title: 'NTT INDYCAR SERIES Warm-up', series: 'INDYCAR', rawText: '9:05-9:35 NTT INDYCAR SERIES Warm-up (30)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'sunday', startTime: '10:06', endTime: '11:01', title: 'INDY NXT Race', series: 'INDY_NXT', rawText: '10:06-11:01 Race (45 laps or 55 mins)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'sunday', startTime: '12:29', endTime: '14:21', title: 'NTT INDYCAR SERIES Race - 100 Laps', series: 'INDYCAR', rawText: 'NTT INDYCAR SERIES Race - 100 Laps', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'sunday', startTime: '15:00', endTime: '15:40', title: 'USF2000 Race 2', series: 'USF2000', rawText: '3:00-3:40 USF2000 Race 2 (40)', confidence: 1 },
  { id: generateId(), weekendId: WEEKEND_ID, day: 'sunday', startTime: '16:00', endTime: '16:40', title: 'MX-5 Cup Race #2', series: 'MX5_CUP', rawText: '4:00-4:40 MX-5 Cup Race #2 (40)', confidence: 1 },
];

function makeSeedActivities(people: Person[]): Activity[] {
  const getPeople = (dept: DepartmentId) => people.filter((p) => p.departmentId === dept);
  const idOf = (name: string) => people.find((p) => p.name === name)?.id;
  const idsOf = (...names: string[]) => names.map(idOf).filter((id): id is string => !!id);
  const now = new Date().toISOString();

  return [
    // Wednesday
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Hospitality Suite Setup',
      departmentIds: ['brand-experiences'],
      personIds: getPeople('brand-experiences').map((p) => p.id),
      day: 'wednesday', startTime: '10:00', endTime: '16:00', location: 'Hospitality',
      status: 'confirmed', notes: 'Full hospitality suite setup - furniture, signage, AV equipment', createdAt: now, updatedAt: now,
    },
    // Thursday
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Transporter Setup & Branding',
      departmentIds: ['brand-experiences', 'partnerships'],
      personIds: [...getPeople('brand-experiences').slice(0, 2).map((p) => p.id), ...idsOf('Elizabeth Wood', 'Tanner Higgins')],
      day: 'thursday', startTime: '09:00', endTime: '12:00', location: 'Paddock',
      status: 'confirmed', notes: 'Sponsor signage placement, transporter wrap check, hospitality branding', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Driver Headshots & Portrait Session',
      departmentIds: ['photography', 'drivers'],
      personIds: [...getPeople('photography').map((p) => p.id), ...getPeople('drivers').map((p) => p.id)],
      day: 'thursday', startTime: '13:00', endTime: '15:00', location: 'Garage',
      status: 'confirmed', notes: 'Updated headshots for all three drivers. Stillhouse shooting.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Content Planning Meeting',
      departmentIds: ['social-content', 'photography'],
      personIds: [...getPeople('social-content').map((p) => p.id), ...getPeople('photography').map((p) => p.id)],
      day: 'thursday', startTime: '15:30', endTime: '16:30', location: 'Transporter',
      status: 'confirmed', notes: 'Walk through weekend content plan, shot lists, posting schedule', createdAt: now, updatedAt: now,
    },
    // Friday
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Driver Content Shoot - In-Car Camera Setup',
      departmentIds: ['social-content'],
      personIds: idsOf('Alex Frick', 'Ryan Sawrie'),
      day: 'friday', startTime: '07:30', endTime: '08:30', location: 'Garage',
      status: 'confirmed', notes: 'Setup GoPros and in-car cameras for all three cars before Practice 1', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Fan Zone Setup & Walk-Through',
      departmentIds: ['brand-experiences'],
      personIds: getPeople('brand-experiences').map((p) => p.id),
      day: 'friday', startTime: '08:00', endTime: '11:00', location: 'Fan Zone',
      status: 'confirmed', notes: 'Activation area, photo wall, merch display, simulator setup', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Prospective Client Suite Tour',
      departmentIds: ['sales', 'partnerships'],
      personIds: idsOf('Kyle Moeller', 'Matt Kennedy'),
      day: 'friday', startTime: '11:00', endTime: '12:30', location: 'Hospitality',
      status: 'pending', notes: 'Tour for 3 potential sponsors. Include pit lane access.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Title Sponsor Hospitality Check-In',
      departmentIds: ['partnerships'],
      personIds: idsOf('Matt Kennedy', 'Dan Savka', 'Elizabeth Wood'),
      day: 'friday', startTime: '12:00', endTime: '13:30', location: 'Hospitality',
      status: 'confirmed', notes: 'Ensure sponsor suite setup, signage, and gifts are ready', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Practice 1 Content Coverage',
      departmentIds: ['social-content', 'photography'],
      personIds: [...getPeople('social-content').map((p) => p.id), ...getPeople('photography').map((p) => p.id)],
      day: 'friday', startTime: '13:30', endTime: '15:30', location: 'Pit Lane',
      status: 'confirmed', notes: 'Live coverage of P1. Instagram stories, TikTok, X posts. Stillhouse on pit wall.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Executive Track Walk',
      departmentIds: ['executives'],
      personIds: getPeople('executives').map((p) => p.id),
      day: 'friday', startTime: '16:30', endTime: '17:30', location: 'Track',
      status: 'confirmed', notes: 'Mark, Jill, and Dan walking the facility with track officials', createdAt: now, updatedAt: now,
    },
    // Saturday
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Driver Pre-Qualifying Interview',
      departmentIds: ['social-content', 'drivers'],
      personIds: idsOf('Mark Grainda', 'Alex Frick', 'Will Power'),
      day: 'saturday', startTime: '08:00', endTime: '08:30', location: 'Transporter',
      status: 'confirmed', notes: 'Quick pre-qualifying thoughts with Will. Video + social clips.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'VIP Hospitality Experience',
      departmentIds: ['brand-experiences', 'sales', 'partnerships'],
      personIds: [...getPeople('brand-experiences').slice(0, 2).map((p) => p.id), ...idsOf('Kyle Moeller', 'Matt Kennedy', 'Eric')],
      day: 'saturday', startTime: '10:00', endTime: '14:00', location: 'Hospitality',
      status: 'confirmed', notes: 'Full VIP experience: garage tour, pit lane walk, lunch, qualifying viewing', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Qualifying Content Capture',
      departmentIds: ['social-content', 'photography'],
      personIds: [...getPeople('social-content').map((p) => p.id), ...getPeople('photography').map((p) => p.id)],
      day: 'saturday', startTime: '16:30', endTime: '18:30', location: 'Pit Lane',
      status: 'confirmed', notes: 'All hands on deck for qualifying coverage. Stillhouse pit lane, content team pit wall + garage.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Partner Dinner',
      departmentIds: ['partnerships', 'sales', 'executives'],
      personIds: [...getPeople('partnerships').slice(0, 3).map((p) => p.id), ...idsOf('Kyle Moeller', 'Mark Myers', 'Jill Gregory')],
      day: 'saturday', startTime: '19:00', endTime: '21:30', location: 'Other',
      status: 'pending', notes: 'Dinner with key partners. 12 guests total. Restaurant TBD.', createdAt: now, updatedAt: now,
    },
    // Sunday
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Race Day Content Strategy Meeting',
      departmentIds: ['social-content', 'photography'],
      personIds: [...getPeople('social-content').slice(0, 3).map((p) => p.id), ...getPeople('photography').map((p) => p.id)],
      day: 'sunday', startTime: '07:30', endTime: '08:00', location: 'Transporter',
      status: 'confirmed', notes: 'Align on race day content plan, assign positions for race coverage', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Pre-Race Grid Walk - Sponsors',
      departmentIds: ['partnerships', 'sales', 'brand-experiences', 'executives'],
      personIds: [...getPeople('partnerships').slice(0, 3).map((p) => p.id), ...idsOf('Kyle Moeller'), ...getPeople('brand-experiences').slice(0, 2).map((p) => p.id), ...idsOf('Mark Myers')],
      day: 'sunday', startTime: '11:35', endTime: '12:01', location: 'Grid',
      status: 'confirmed', notes: 'Escort sponsor guests on grid walk. Max 20 guests.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Race Coverage - All Positions',
      departmentIds: ['social-content', 'photography'],
      personIds: [...getPeople('social-content').map((p) => p.id), ...getPeople('photography').map((p) => p.id)],
      day: 'sunday', startTime: '12:15', endTime: '15:00', location: 'Pit Lane',
      status: 'confirmed', notes: 'Full race coverage. Positions: pit wall (Stillhouse), pit lane (Alex F), garage (Ryan), media center (Kylie), fan zone (Devin).', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Post-Race Victory Circle',
      departmentIds: ['social-content', 'photography', 'executives'],
      personIds: [...getPeople('social-content').slice(0, 2).map((p) => p.id), ...getPeople('photography').map((p) => p.id), ...idsOf('Dan Towriss')],
      day: 'sunday', startTime: '14:30', endTime: '15:30', location: 'Victory Circle',
      status: 'pending', notes: 'Depends on race result. If podium, all hands for celebration content.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: WEEKEND_ID, name: 'Post-Race Content & Recap',
      departmentIds: ['social-content'],
      personIds: getPeople('social-content').map((p) => p.id),
      day: 'sunday', startTime: '15:30', endTime: '17:00', location: 'Transporter',
      status: 'pending', notes: 'Edit and publish race recap video, photo gallery, social posts', createdAt: now, updatedAt: now,
    },
  ];
}

export async function seedDatabase(): Promise<void> {
  const existingWeekends = await db.raceWeekends.count();
  if (existingWeekends > 0) return; // Already seeded

  await db.transaction('rw', [db.raceWeekends, db.masterEvents, db.activities, db.people], async () => {
    await db.raceWeekends.add(seedWeekend);
    await db.masterEvents.bulkAdd(seedMasterEvents);
    await db.people.bulkAdd(seedPeople);

    const storedPeople = await db.people.toArray();
    const activities = makeSeedActivities(storedPeople);
    await db.activities.bulkAdd(activities);
  });
}
