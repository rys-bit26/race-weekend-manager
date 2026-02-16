import 'dotenv/config';
import { db, schema } from './index.js';

const STPETE_ID = 'seed-weekend-stpete-2026';
const PHOENIX_ID = 'seed-weekend-phoenix-2026';
const ARLINGTON_ID = 'seed-weekend-arlington-2026';

// Fixed UUIDs for seed people so personIds in activities are stable
const PEOPLE_IDS = {
  markGrainda: 'seed-p-mark-grainda',
  alexFrick: 'seed-p-alex-frick',
  kylieWagner: 'seed-p-kylie-wagner',
  devinWelch: 'seed-p-devin-welch',
  ryanSawrie: 'seed-p-ryan-sawrie',
  mattKennedy: 'seed-p-matt-kennedy',
  eric: 'seed-p-eric',
  danSavka: 'seed-p-dan-savka',
  elizabethWood: 'seed-p-elizabeth-wood',
  tannerHiggins: 'seed-p-tanner-higgins',
  stephanieHeinz: 'seed-p-stephanie-heinz',
  richieBest: 'seed-p-richie-best',
  alexSevening: 'seed-p-alex-sevening',
  tylerMartin: 'seed-p-tyler-martin',
  kyleMoeller: 'seed-p-kyle-moeller',
  willPower: 'seed-p-will-power',
  kyleKirkwood: 'seed-p-kyle-kirkwood',
  marcusEricsson: 'seed-p-marcus-ericsson',
  stillhouse: 'seed-p-stillhouse',
  markMyers: 'seed-p-mark-myers',
  jillGregory: 'seed-p-jill-gregory',
  danTowriss: 'seed-p-dan-towriss',
};

const P = PEOPLE_IDS;

async function main() {
  console.log('🌱 Seeding database...');

  // Check if already seeded
  const existing = await db.select().from(schema.raceWeekends);
  if (existing.length > 0) {
    console.log('Database already has data, skipping seed.');
    return;
  }

  const now = new Date().toISOString();

  // ── Race Weekends ──
  await db.insert(schema.raceWeekends).values([
    { id: STPETE_ID, name: 'Streets of St. Petersburg 2026', trackName: 'Streets of St. Petersburg', location: 'St. Petersburg, FL', startDate: '2026-02-25', endDate: '2026-03-01', createdAt: now, updatedAt: now },
    { id: PHOENIX_ID, name: 'Phoenix Raceway 2026', trackName: 'Phoenix Raceway', location: 'Avondale, AZ', startDate: '2026-03-02', endDate: '2026-03-08', createdAt: now, updatedAt: now },
    { id: ARLINGTON_ID, name: 'Grand Prix of Arlington 2026', trackName: 'Grand Prix of Arlington', location: 'Arlington, TX', startDate: '2026-03-13', endDate: '2026-03-15', createdAt: now, updatedAt: now },
  ]);

  // ── People ──
  await db.insert(schema.people).values([
    { id: P.markGrainda, name: 'Mark Grainda', departmentId: 'social-content', role: 'Content Director', email: 'mgrainda@andretti.com', phoneNumber: '+1 (317) 555-0101', smsOptIn: true },
    { id: P.alexFrick, name: 'Alex Frick', departmentId: 'social-content', role: 'Videographer', email: 'africk@andretti.com', phoneNumber: '+1 (317) 555-0102', smsOptIn: true },
    { id: P.kylieWagner, name: 'Kylie Wagner', departmentId: 'social-content', role: 'Social Media Manager', email: 'kwagner@andretti.com', phoneNumber: '+1 (317) 555-0103', smsOptIn: true },
    { id: P.devinWelch, name: 'Devin Welch', departmentId: 'social-content', role: 'Content Creator', email: 'dwelch@andretti.com', phoneNumber: '+1 (317) 555-0104', smsOptIn: false },
    { id: P.ryanSawrie, name: 'Ryan Sawrie', departmentId: 'social-content', role: 'Content Creator', email: 'rsawrie@andretti.com', phoneNumber: '+1 (317) 555-0105', smsOptIn: true },
    { id: P.mattKennedy, name: 'Matt Kennedy', departmentId: 'partnerships', role: 'Partnerships Director', email: 'mkennedy@andretti.com', phoneNumber: '+1 (317) 555-0201', smsOptIn: true },
    { id: P.eric, name: 'Eric', departmentId: 'partnerships', role: 'Partner Manager', email: 'eric@andretti.com', phoneNumber: '+1 (317) 555-0202', smsOptIn: false },
    { id: P.danSavka, name: 'Dan Savka', departmentId: 'partnerships', role: 'Partner Manager', email: 'dsavka@andretti.com', phoneNumber: '+1 (317) 555-0203', smsOptIn: true },
    { id: P.elizabethWood, name: 'Elizabeth Wood', departmentId: 'partnerships', role: 'Activation Manager', email: 'ewood@andretti.com', phoneNumber: '+1 (317) 555-0204', smsOptIn: true },
    { id: P.tannerHiggins, name: 'Tanner Higgins', departmentId: 'partnerships', role: 'Coordinator', email: 'thiggins@andretti.com', phoneNumber: '+1 (317) 555-0205', smsOptIn: false },
    { id: P.stephanieHeinz, name: 'Stephanie Heinz', departmentId: 'brand-experiences', role: 'BX Director', email: 'sheinz@andretti.com', phoneNumber: '+1 (317) 555-0301', smsOptIn: true },
    { id: P.richieBest, name: 'Richie Best', departmentId: 'brand-experiences', role: 'Event Manager', email: 'rbest@andretti.com', phoneNumber: '+1 (317) 555-0302', smsOptIn: true },
    { id: P.alexSevening, name: 'Alex Sevening', departmentId: 'brand-experiences', role: 'Activation Specialist', email: 'asevening@andretti.com', phoneNumber: '+1 (317) 555-0303', smsOptIn: false },
    { id: P.tylerMartin, name: 'Tyler Martin', departmentId: 'brand-experiences', role: 'Fan Engagement', email: 'tmartin@andretti.com', phoneNumber: '+1 (317) 555-0304', smsOptIn: true },
    { id: P.kyleMoeller, name: 'Kyle Moeller', departmentId: 'sales', role: 'Sales Director', email: 'kmoeller@andretti.com', phoneNumber: '+1 (317) 555-0401', smsOptIn: true },
    { id: P.willPower, name: 'Will Power', departmentId: 'drivers', role: 'Driver', email: 'wpower@andretti.com' },
    { id: P.kyleKirkwood, name: 'Kyle Kirkwood', departmentId: 'drivers', role: 'Driver', email: 'kkirkwood@andretti.com' },
    { id: P.marcusEricsson, name: 'Marcus Ericsson', departmentId: 'drivers', role: 'Driver', email: 'mericsson@andretti.com' },
    { id: P.stillhouse, name: 'Stillhouse', departmentId: 'photography', role: 'Photography', email: 'stillhouse@andretti.com', phoneNumber: '+1 (317) 555-0501', smsOptIn: true },
    { id: P.markMyers, name: 'Mark Myers', departmentId: 'executives', role: 'Executive', email: 'mmyers@andretti.com', phoneNumber: '+1 (317) 555-0601', smsOptIn: false },
    { id: P.jillGregory, name: 'Jill Gregory', departmentId: 'executives', role: 'Executive', email: 'jgregory@andretti.com', phoneNumber: '+1 (317) 555-0602', smsOptIn: false },
    { id: P.danTowriss, name: 'Dan Towriss', departmentId: 'executives', role: 'Executive', email: 'dtowriss@andretti.com', phoneNumber: '+1 (317) 555-0603', smsOptIn: false },
  ]);

  // ── Master Events (St. Pete) — abbreviated sample ──
  const stPeteMasterEvents = [
    { id: crypto.randomUUID(), weekendId: STPETE_ID, day: 'thursday', startTime: '08:00', endTime: '11:30', title: 'Setup', series: 'GENERAL', rawText: '8:00-11:30 Setup', confidence: 1 },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, day: 'thursday', startTime: '11:00', endTime: '17:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '11:00-5:00 PM Media Center Hours', confidence: 1 },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, day: 'thursday', startTime: '12:00', endTime: '18:00', title: 'NICS Garage Open - All Crew', series: 'INDYCAR', rawText: '12:00-6:00 PM NICS Garage', confidence: 1 },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, day: 'friday', startTime: '07:00', endTime: '20:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '7:00-8:00 PM Media Center Hours', confidence: 1 },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, day: 'friday', startTime: '06:30', endTime: '08:00', title: 'Track Inspection', series: 'GENERAL', rawText: '6:30-8:00 Track Inspection', confidence: 1 },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, day: 'friday', startTime: '08:00', endTime: '08:35', title: 'USF2000 Practice', series: 'USF2000', rawText: '8:00-8:35 USF2000 Practice', confidence: 1 },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, day: 'friday', startTime: '13:35', endTime: '15:00', title: 'NTT INDYCAR SERIES Practice 1 - Groups', series: 'INDYCAR', rawText: '1:35-3:00 NTT INDYCAR SERIES Practice 1', confidence: 1 },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, day: 'saturday', startTime: '07:00', endTime: '21:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '7:00-9:00 PM Media Center Hours', confidence: 1 },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, day: 'saturday', startTime: '16:35', endTime: '18:00', title: 'NTT INDYCAR SERIES Qualifications', series: 'INDYCAR', rawText: '4:35-6:00 NTT INDYCAR SERIES Qualifications', confidence: 1 },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, day: 'sunday', startTime: '12:29', endTime: '14:21', title: 'NTT INDYCAR SERIES Race - 100 Laps', series: 'INDYCAR', rawText: 'NTT INDYCAR SERIES Race - 100 Laps', confidence: 1 },
  ];

  await db.insert(schema.masterEvents).values(stPeteMasterEvents);

  // ── Activities (St. Pete sample) ──
  const bxPeople = [P.stephanieHeinz, P.richieBest, P.alexSevening, P.tylerMartin];
  const scPeople = [P.markGrainda, P.alexFrick, P.kylieWagner, P.devinWelch, P.ryanSawrie];
  const photoPeople = [P.stillhouse];
  const driverPeople = [P.willPower, P.kyleKirkwood, P.marcusEricsson];
  const execPeople = [P.markMyers, P.jillGregory, P.danTowriss];

  await db.insert(schema.activities).values([
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'Hospitality Suite Setup', departmentIds: ['brand-experiences'], personIds: bxPeople, day: 'wednesday', startTime: '10:00', endTime: '16:00', location: 'Hospitality', status: 'confirmed', notes: 'Full hospitality suite setup', createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'Transporter Setup & Branding', departmentIds: ['brand-experiences', 'partnerships'], personIds: [P.stephanieHeinz, P.richieBest, P.elizabethWood, P.tannerHiggins], day: 'thursday', startTime: '09:00', endTime: '12:00', location: 'Paddock', status: 'confirmed', notes: 'Sponsor signage placement', createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'Driver Headshots & Portrait Session', departmentIds: ['photography', 'drivers'], personIds: [...photoPeople, ...driverPeople], day: 'thursday', startTime: '13:00', endTime: '15:00', location: 'Garage', status: 'confirmed', notes: 'Updated headshots for all three drivers', createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'Content Planning Meeting', departmentIds: ['social-content', 'photography'], personIds: [...scPeople, ...photoPeople], day: 'thursday', startTime: '15:30', endTime: '16:30', location: 'Transporter', status: 'confirmed', notes: 'Walk through weekend content plan', createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'Driver Content Shoot - In-Car Camera Setup', departmentIds: ['social-content'], personIds: [P.alexFrick, P.ryanSawrie], day: 'friday', startTime: '07:30', endTime: '08:30', location: 'Garage', status: 'confirmed', notes: 'Setup GoPros and in-car cameras', createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'Fan Zone Setup & Walk-Through', departmentIds: ['brand-experiences'], personIds: bxPeople, day: 'friday', startTime: '08:00', endTime: '11:00', location: 'Fan Zone', status: 'confirmed', notes: 'Activation area, photo wall, merch display', createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'Prospective Client Suite Tour', departmentIds: ['sales', 'partnerships'], personIds: [P.kyleMoeller, P.mattKennedy], day: 'friday', startTime: '11:00', endTime: '12:30', location: 'Hospitality', status: 'pending', notes: 'Tour for 3 potential sponsors', createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'Practice 1 Content Coverage', departmentIds: ['social-content', 'photography'], personIds: [...scPeople, ...photoPeople], day: 'friday', startTime: '13:30', endTime: '15:30', location: 'Pit Lane', status: 'confirmed', notes: 'Live coverage of P1', createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'Executive Track Walk', departmentIds: ['executives'], personIds: execPeople, day: 'friday', startTime: '16:30', endTime: '17:30', location: 'Track', status: 'confirmed', notes: 'Walking the facility with track officials', createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'VIP Hospitality Experience', departmentIds: ['brand-experiences', 'sales', 'partnerships'], personIds: [P.stephanieHeinz, P.richieBest, P.kyleMoeller, P.mattKennedy, P.eric], day: 'saturday', startTime: '10:00', endTime: '14:00', location: 'Hospitality', status: 'confirmed', notes: 'Full VIP experience', createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'Qualifying Content Capture', departmentIds: ['social-content', 'photography'], personIds: [...scPeople, ...photoPeople], day: 'saturday', startTime: '16:30', endTime: '18:30', location: 'Pit Lane', status: 'confirmed', notes: 'All hands on deck for qualifying coverage', createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'Race Coverage - All Positions', departmentIds: ['social-content', 'photography'], personIds: [...scPeople, ...photoPeople], day: 'sunday', startTime: '12:15', endTime: '15:00', location: 'Pit Lane', status: 'confirmed', notes: 'Full race coverage', createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), weekendId: STPETE_ID, name: 'Pre-Race Grid Walk - Sponsors', departmentIds: ['partnerships', 'sales', 'brand-experiences', 'executives'], personIds: [P.mattKennedy, P.danSavka, P.eric, P.kyleMoeller, P.stephanieHeinz, P.richieBest, P.markMyers], day: 'sunday', startTime: '11:35', endTime: '12:01', location: 'Grid', status: 'confirmed', notes: 'Escort sponsor guests on grid walk', createdAt: now, updatedAt: now },
  ]);

  console.log('✅ Seed complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
