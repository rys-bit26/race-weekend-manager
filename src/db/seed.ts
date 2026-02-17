import { db } from './database';
import { generateId } from '../utils/id';
import type { RaceWeekend, MasterScheduleEvent } from '../types/schedule';
import type { Activity, Person, DepartmentId } from '../types/activity';

const STPETE_ID = 'seed-weekend-stpete-2026';
const PHOENIX_ID = 'seed-weekend-phoenix-2026';
const ARLINGTON_ID = 'seed-weekend-arlington-2026';

const seedWeekends: RaceWeekend[] = [
  {
    id: STPETE_ID,
    name: 'Streets of St. Petersburg 2026',
    trackName: 'Streets of St. Petersburg',
    location: 'St. Petersburg, FL',
    startDate: '2026-02-25',
    endDate: '2026-03-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: PHOENIX_ID,
    name: 'Phoenix Raceway 2026',
    trackName: 'Phoenix Raceway',
    location: 'Avondale, AZ',
    startDate: '2026-03-02',
    endDate: '2026-03-08',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: ARLINGTON_ID,
    name: 'Grand Prix of Arlington 2026',
    trackName: 'Grand Prix of Arlington',
    location: 'Arlington, TX',
    startDate: '2026-03-13',
    endDate: '2026-03-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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

// ──── St. Petersburg Master Events ────
const stPeteMasterEvents: MasterScheduleEvent[] = [
  // Thursday
  { id: generateId(), weekendId: STPETE_ID, day: 'thursday', startTime: '08:00', endTime: '11:30', title: 'Setup', series: 'GENERAL', rawText: '8:00-11:30 Setup (3 hours 30 mins)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'thursday', startTime: '11:00', endTime: '17:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '11:00-5:00 PM Media Center Hours', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'thursday', startTime: '12:00', endTime: '18:00', title: 'NICS Garage Open - All Crew', series: 'INDYCAR', rawText: '12:00-6:00 PM NICS Garage, All Crew', confidence: 1 },
  // Friday
  { id: generateId(), weekendId: STPETE_ID, day: 'friday', startTime: '07:00', endTime: '20:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '7:00-8:00 PM Media Center Hours', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'friday', startTime: '06:30', endTime: '08:00', title: 'Track Inspection', series: 'GENERAL', rawText: '6:30-8:00 Track Inspection Slow! (90)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'friday', startTime: '08:00', endTime: '08:35', title: 'USF2000 Practice', series: 'USF2000', rawText: '8:00-8:35 USF2000 Practice (35)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'friday', startTime: '08:55', endTime: '09:40', title: 'MX-5 Cup Practice', series: 'MX5_CUP', rawText: '8:55-9:40 MX-5 Cup Practice (45)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'friday', startTime: '10:00', endTime: '10:30', title: 'USF2000 Qualifying', series: 'USF2000', rawText: '10:00-10:30 USF2000 Qualifying (30)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'friday', startTime: '10:50', endTime: '11:10', title: 'MX-5 Cup Qualifying', series: 'MX5_CUP', rawText: '10:50-11:10 MX-5 Cup Qualifying (20)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'friday', startTime: '11:30', endTime: '12:10', title: 'USF2000 Race 1', series: 'USF2000', rawText: '11:30-12:10 USF2000 Race 1 (40)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'friday', startTime: '12:30', endTime: '13:15', title: 'INDY NXT Practice 1', series: 'INDY_NXT', rawText: '12:30-1:15 INDY NXT Practice 1 (45)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'friday', startTime: '13:35', endTime: '15:00', title: 'NTT INDYCAR SERIES Practice 1 - Groups', series: 'INDYCAR', rawText: '1:35-3:00 NTT INDYCAR SERIES Practice 1 - Groups (40/12/12)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'friday', startTime: '16:00', endTime: '16:50', title: 'NCTS Practice', series: 'NCTS', rawText: '4:00-4:50 NCTS Practice (50)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'friday', startTime: '17:05', endTime: '18:00', title: 'NCTS Qualifying', series: 'NCTS', rawText: '5:05-6:00 NCTS Qualifying (55)', confidence: 1 },
  // Saturday
  { id: generateId(), weekendId: STPETE_ID, day: 'saturday', startTime: '07:00', endTime: '21:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '7:00-9:00 PM Media Center Hours', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'saturday', startTime: '06:30', endTime: '07:30', title: 'Track Inspection', series: 'GENERAL', rawText: '6:30-7:30 Track Inspection Slow! (60)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'saturday', startTime: '07:30', endTime: '08:15', title: 'MX-5 Cup Race #1', series: 'MX5_CUP', rawText: '7:30-8:15 MX-5 Cup Race #1 (40)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'saturday', startTime: '08:35', endTime: '09:15', title: 'INDY NXT Practice 2', series: 'INDY_NXT', rawText: '8:35-9:15 INDY NXT Practice 2 (40)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'saturday', startTime: '09:35', endTime: '11:00', title: 'NTT INDYCAR SERIES Practice 2 - Groups', series: 'INDYCAR', rawText: '9:35-11:00 NTT INDYCAR SERIES Practice 2 - Groups (40/12/12)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'saturday', startTime: '12:00', endTime: '12:00', title: 'NCTS Race', series: 'NCTS', rawText: '? 12:00 NCTS Race 80 Laps', confidence: 0.8 },
  { id: generateId(), weekendId: STPETE_ID, day: 'saturday', startTime: '15:45', endTime: '16:15', title: 'INDY NXT Qualifying', series: 'INDY_NXT', rawText: '3:45-4:15 INDY NXT Q (30)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'saturday', startTime: '16:35', endTime: '18:00', title: 'NTT INDYCAR SERIES Qualifications', series: 'INDYCAR', rawText: '4:35-6:00 NTT INDYCAR SERIES Qualifications', confidence: 1 },
  // Sunday
  { id: generateId(), weekendId: STPETE_ID, day: 'sunday', startTime: '06:30', endTime: '19:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '6:30-7:00 PM Media Center Hours', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'sunday', startTime: '06:30', endTime: '07:45', title: 'Track Inspection', series: 'GENERAL', rawText: '6:30-7:45 Track Inspection Slow! (75)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'sunday', startTime: '07:45', endTime: '08:45', title: 'Alt. 2 Seater, Event Cars', series: 'SUPPORT', rawText: '7:45-8:45, Alt. 2 Seater, Event Cars (60)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'sunday', startTime: '09:05', endTime: '09:35', title: 'NTT INDYCAR SERIES Warm-up', series: 'INDYCAR', rawText: '9:05-9:35 NTT INDYCAR SERIES Warm-up (30)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'sunday', startTime: '10:06', endTime: '11:01', title: 'INDY NXT Race', series: 'INDY_NXT', rawText: '10:06-11:01 Race (45 laps or 55 mins)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'sunday', startTime: '12:29', endTime: '14:21', title: 'NTT INDYCAR SERIES Race - 100 Laps', series: 'INDYCAR', rawText: 'NTT INDYCAR SERIES Race - 100 Laps', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'sunday', startTime: '15:00', endTime: '15:40', title: 'USF2000 Race 2', series: 'USF2000', rawText: '3:00-3:40 USF2000 Race 2 (40)', confidence: 1 },
  { id: generateId(), weekendId: STPETE_ID, day: 'sunday', startTime: '16:00', endTime: '16:40', title: 'MX-5 Cup Race #2', series: 'MX5_CUP', rawText: '4:00-4:40 MX-5 Cup Race #2 (40)', confidence: 1 },
];

// ──── Phoenix Raceway Master Events (from v8 PDF) ────
const phoenixMasterEvents: MasterScheduleEvent[] = [
  // Thursday (March 5) - Load In, ARCA P/Q/R
  { id: generateId(), weekendId: PHOENIX_ID, day: 'thursday', startTime: '09:00', endTime: '16:00', title: 'INDYCAR Credentials', series: 'GENERAL', rawText: '9:00-4:00 PM INDYCAR Credentials', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'thursday', startTime: '08:00', endTime: '19:30', title: 'NICS Garage - Thu Teams', series: 'INDYCAR', rawText: '8:00-7:30 PM NICS Garage-Thu Teams', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'thursday', startTime: '14:00', endTime: '14:30', title: 'NICS Tech', series: 'INDYCAR', rawText: '2:00 NICS Tech', confidence: 0.9 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'thursday', startTime: '06:00', endTime: '16:00', title: 'Credential Hours', series: 'GENERAL', rawText: '6:00-4:00 PM Credential Hours', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'thursday', startTime: '07:00', endTime: '08:00', title: 'Haulers Enter (Parking)', series: 'GENERAL', rawText: '7:00-8:00 AM Haulers Enter (Parking)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'thursday', startTime: '11:30', endTime: '12:00', title: 'Driver/Spotter Meeting', series: 'INDYCAR', rawText: '11:30 Drive/Spotter Meeting', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'thursday', startTime: '11:30', endTime: '12:30', title: 'Driver/Team Track Walk', series: 'INDYCAR', rawText: '11:30-12:30 Driver/Team Track Walk', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'thursday', startTime: '13:30', endTime: '14:15', title: 'ARCA Menards Series Practice (Timed)', series: 'SUPPORT', rawText: '1:30-2:15 Practice (Timed)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'thursday', startTime: '14:30', endTime: '14:50', title: 'ARCA Menards Series Qualifying (Impound)', series: 'SUPPORT', rawText: '2:30-2:50 Qualifying (Impound)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'thursday', startTime: '15:40', endTime: '16:00', title: 'Driver Introductions', series: 'SUPPORT', rawText: '3:40 Driver Introductions', confidence: 0.9 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'thursday', startTime: '16:00', endTime: '18:00', title: 'ARCA Menards Series Race - 150 Laps', series: 'SUPPORT', rawText: '4:00 PM AMS Race 150 Laps, 150 Miles', confidence: 1 },
  // Friday (March 6) - NICS P/Q/P, NXS P/Q
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '05:30', endTime: '16:00', title: 'INDYCAR Credentials', series: 'GENERAL', rawText: '5:30-4:00 PM INDYCAR Credentials', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '05:30', endTime: '19:00', title: 'NICS Garage Hours', series: 'INDYCAR', rawText: '5:30 AM-7:00 PM NICS Garage', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '06:30', endTime: '07:00', title: 'IC Safety Meeting', series: 'INDYCAR', rawText: '6:30 IC Safety Meeting', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '07:00', endTime: '07:15', title: 'Technology Track Sweep', series: 'GENERAL', rawText: '7:00-7:15 Technology Track Sweep(15)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '08:00', endTime: '09:00', title: 'NTT INDYCAR SERIES Practice (60)', series: 'INDYCAR', rawText: '8:00-9:00 NTT INDYCAR SERIES Practice (60)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '10:00', endTime: '12:00', title: 'Haulers Enter (Unload)', series: 'GENERAL', rawText: '10:00-12:00 Haulers Enter (Unload)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '11:30', endTime: '19:30', title: 'NICS Garage Hours', series: 'INDYCAR', rawText: '11:30-7:30 PM Garage Hours', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '12:05', endTime: '13:05', title: 'NTT INDYCAR SERIES Qualifying (60)', series: 'INDYCAR', rawText: '12:05-1:05 NTT INDYCAR SERIES Qualifying (60)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '14:30', endTime: '15:00', title: 'High Line Practice - Group A (15)', series: 'INDYCAR', rawText: '2:30-2:45 GROUP A (15)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '14:45', endTime: '15:00', title: 'High Line Practice - Group B (15)', series: 'INDYCAR', rawText: '2:45-3:00 GROUP B (15)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '15:10', endTime: '16:00', title: 'NTT INDYCAR SERIES Final Practice (50)', series: 'INDYCAR', rawText: '3:10-4:00 NTT INDYCAR SERIES Final Practice (50)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '17:00', endTime: '17:50', title: 'NOAPS Practice', series: 'SUPPORT', rawText: '5:00-5:50 NOAPS Practice', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '18:05', endTime: '19:00', title: 'NOAPS Qualifying (Impound)', series: 'SUPPORT', rawText: '6:05-7:00 NOAPS Qualifying (Impound)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'friday', startTime: '19:30', endTime: '20:30', title: 'VIP Rides / 2 Seaters / Event Cars (60)', series: 'SUPPORT', rawText: '7:30-8:30 PM, VIP Rides, Alternate INDYCAR Experience 2 Seaters & Event Car Rides (60 mins)', confidence: 1 },
  // Saturday (March 7) - NICS R, NXS R, NCS P/Q
  { id: generateId(), weekendId: PHOENIX_ID, day: 'saturday', startTime: '08:00', endTime: '13:20', title: 'INDYCAR Credentials', series: 'GENERAL', rawText: '8:00-1:20 PM INDYCAR Credentials', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'saturday', startTime: '08:00', endTime: '21:30', title: 'NICS Garage Hours', series: 'INDYCAR', rawText: '8:00 AM-9:30 PM NICS Garage Hours', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'saturday', startTime: '08:30', endTime: '10:00', title: 'Mandatory Tech Inspection', series: 'INDYCAR', rawText: '8:30-10:00 AM Mandatory Tech Inspection', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'saturday', startTime: '08:00', endTime: '09:00', title: 'Driver/Team Track Walk', series: 'INDYCAR', rawText: '8:00-9:00 Driver/Team Track Walk', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'saturday', startTime: '10:00', endTime: '11:00', title: 'NCS Practice', series: 'NCTS', rawText: '10:00-11:00 Practice', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'saturday', startTime: '11:10', endTime: '12:00', title: 'NCS Qualifying (Impound)', series: 'NCTS', rawText: '11:10-12:00 Qualifying (Impound)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'saturday', startTime: '12:00', endTime: '21:30', title: 'NICS Garage Hours', series: 'INDYCAR', rawText: '12:00-9:30 PM Garage Hours', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'saturday', startTime: '12:56', endTime: '12:59', title: 'Invocation/Anthem Package', series: 'INDYCAR', rawText: '12:56-12:59 Invocation/Anthem Package', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'saturday', startTime: '13:00', endTime: '15:30', title: 'NTT INDYCAR SERIES Race - 250 Laps', series: 'INDYCAR', rawText: '1:00-3:30 PM NTT INDYCAR SERIES Race - 250 Laps', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'saturday', startTime: '16:00', endTime: '16:30', title: 'Grid Access (until end of Anthem)', series: 'SUPPORT', rawText: '4:00 Grid Access, until end of Anthem', confidence: 0.9 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'saturday', startTime: '17:05', endTime: '17:30', title: 'Driver Introductions', series: 'SUPPORT', rawText: '5:05 Driver Introductions', confidence: 0.9 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'saturday', startTime: '17:30', endTime: '20:00', title: 'NOAPS Race - 200 Miles', series: 'SUPPORT', rawText: '5:30 PM NOAPS Race Stages 45/90/200, 200 Miles', confidence: 1 },
  // Sunday (March 8) - NCS Race
  { id: generateId(), weekendId: PHOENIX_ID, day: 'sunday', startTime: '08:00', endTime: '18:00', title: 'NICS Garage Hours', series: 'INDYCAR', rawText: '8:00 AM-6:00 PM NICS Garage Hours', confidence: 0.9 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'sunday', startTime: '07:45', endTime: '08:45', title: 'NASCAR VIP Track Laps', series: 'NCTS', rawText: '7:45-8:45 NASCAR VIP Track Laps', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'sunday', startTime: '08:45', endTime: '09:00', title: 'RC-Pace Vehicle Laps', series: 'GENERAL', rawText: '8:45-9:00 RC-Pace Vehicle Laps', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'sunday', startTime: '09:00', endTime: '10:00', title: 'Track Preparation', series: 'GENERAL', rawText: '9:00-10:00 Track Preparation', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'sunday', startTime: '10:00', endTime: '12:15', title: 'Fan Track Access (T3 & T4)', series: 'GENERAL', rawText: '10:00-12:15 Fan Track Access (T3 & T4)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'sunday', startTime: '10:30', endTime: '11:30', title: 'Concert (Staging in Crescent)', series: 'GENERAL', rawText: '10:30-11:30 Concert (Staging in Crescent)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'sunday', startTime: '11:30', endTime: '12:00', title: 'Drivers Meeting (Meeting Room)', series: 'NCTS', rawText: '11:30 Drivers Meeting (Meeting Room)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'sunday', startTime: '11:55', endTime: '12:10', title: 'Driver Introductions (Victory Podium)', series: 'NCTS', rawText: '11:55 Driver Introductions (Victory Podium)', confidence: 1 },
  { id: generateId(), weekendId: PHOENIX_ID, day: 'sunday', startTime: '12:30', endTime: '16:00', title: 'NASCAR Cup Series Race - 312 Miles', series: 'NCTS', rawText: '12:30 NCS Race Stages 60/185/312, 312 Miles', confidence: 1 },
];

// ──── Arlington Master Events (from v9 PDF) ────
const arlingtonMasterEvents: MasterScheduleEvent[] = [
  // Friday (March 13) - Tech Day / Practice
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '07:00', endTime: '19:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '7:00-7:00 PM Media Center Hours', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '09:00', endTime: '16:30', title: 'INDYCAR Credentials', series: 'GENERAL', rawText: '9:00-4:30 INDYCAR Credentials', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '09:00', endTime: '19:30', title: 'NICS Garage Hours', series: 'INDYCAR', rawText: '9:00 AM-7:30 PM NICS Garage', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '09:00', endTime: '17:45', title: 'INDY NXT Garage Hours', series: 'INDY_NXT', rawText: '9:00-5:45 PM INDY NXT Garage Hours', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '07:45', endTime: '08:00', title: 'Safety Meeting (Transporter)', series: 'GENERAL', rawText: '7:45 Safety Meeting (Transporter)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '07:00', endTime: '09:00', title: 'Track Inspection Slow! (120)', series: 'GENERAL', rawText: '7:00-9:00 Track Inspection Slow! (120)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '09:05', endTime: '09:35', title: 'GR Cup Practice 1 (30)', series: 'SUPPORT', rawText: '9:05-9:35 GR Cup Practice 1 (30)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '10:00', endTime: '11:00', title: 'Promoter Ride Session (60)', series: 'GENERAL', rawText: '10:00-11:00 (Hold) for Promoter Ride Session (60)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '11:30', endTime: '12:05', title: 'USF Pro 2000 Practice (35)', series: 'USF2000', rawText: '11:30-12:05 USF Pro 2000 P (35)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '12:35', endTime: '13:05', title: 'GR Cup Practice 2 (30)', series: 'SUPPORT', rawText: '12:35-1:05 GR Cup Practice 2 (30)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '12:45', endTime: '13:45', title: 'Driver Autograph Session', series: 'INDYCAR', rawText: '12:45-1:45 Driver Autograph Session', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '14:00', endTime: '14:45', title: 'INDY NXT Practice 1 (45)', series: 'INDY_NXT', rawText: '2:00-2:45 INDY NXT Practice 1 (45)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '15:05', endTime: '16:25', title: 'NTT INDYCAR SERIES Practice 1 - Groups (40/12/12)', series: 'INDYCAR', rawText: '3:05-4:25 NTT INDYCAR SERIES Practice 1 - Groups (40/12/12)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '16:45', endTime: '17:00', title: 'GR Cup Qualifying R1 (15)', series: 'SUPPORT', rawText: '4:45-5:00 GR Cup Q-R1 (15)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '17:15', endTime: '17:45', title: 'USF Pro 2000 Qualifying (30)', series: 'USF2000', rawText: '5:15-5:45 USF Pro 2000 Q (30)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'friday', startTime: '18:00', endTime: '19:00', title: 'Car Corral Laps (60)', series: 'SUPPORT', rawText: '6:00-7:00 Car Corral Laps (60)', confidence: 1 },
  // Saturday (March 14) - Practice / Qualifying
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '07:00', endTime: '19:00', title: 'Media Center Hours', series: 'GENERAL', rawText: '7:00-7:00 PM Media Center Hours', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '05:30', endTime: '16:00', title: 'INDYCAR Credentials', series: 'GENERAL', rawText: '5:30 AM-4:00 PM INDYCAR Credentials', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '05:30', endTime: '17:30', title: 'NICS Garage Hours', series: 'INDYCAR', rawText: '5:30 AM-5:30 PM NICS Garage', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '07:00', endTime: '18:30', title: 'INDY NXT Garage Hours', series: 'INDY_NXT', rawText: '7:00-6:30 INDY NXT Garage Hours', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '07:00', endTime: '07:15', title: 'Safety Meeting (Transporter)', series: 'GENERAL', rawText: '7:00 Safety Meeting (Transporter)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '06:30', endTime: '07:55', title: 'Track Inspection Slow! (85)', series: 'GENERAL', rawText: '6:30-7:55 Track Inspection Slow! (85)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '07:55', endTime: '08:15', title: 'Private Session (20)', series: 'GENERAL', rawText: '7:55-8:15 Private Session (20)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '08:35', endTime: '09:55', title: 'NTT INDYCAR SERIES Practice 2 - Groups (40/12/12)', series: 'INDYCAR', rawText: '8:35-9:55 NTT INDYCAR SERIES Practice 2 - Groups (40/12/12)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '10:15', endTime: '11:00', title: 'INDY NXT Practice 2 (45)', series: 'INDY_NXT', rawText: '10:15-11:00 INDY NXT Practice 2 (45)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '11:20', endTime: '12:05', title: 'GR Cup Race 1 (45)', series: 'SUPPORT', rawText: '11:20-12:05 GR Cup R1 (45)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '12:25', endTime: '13:05', title: 'USF Pro 2000 Race 1 (40)', series: 'USF2000', rawText: '12:25-1:05 USF Pro 2000 R1 (40)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '13:35', endTime: '15:00', title: 'NTT INDYCAR SERIES Qualifications', series: 'INDYCAR', rawText: '1:35-3:00 NTT INDYCAR SERIES Qualifications (S1-10/B/10, S2-B/10, S3-B/6)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '15:30', endTime: '16:00', title: 'INDY NXT Qualifying (30)', series: 'INDY_NXT', rawText: '3:30-4:00 INDY NXT Q (30)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '16:20', endTime: '16:35', title: 'GR Cup Qualifying R2 (15)', series: 'SUPPORT', rawText: '4:20-4:35 GR Cup Q-R2 (15)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '16:55', endTime: '17:35', title: 'USF Pro 2000 Race 2 (40)', series: 'USF2000', rawText: '4:55-5:35 USF Pro 2000 R2 (40)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'saturday', startTime: '17:50', endTime: '18:50', title: 'Alt. 2 Seater, Event Cars (60)', series: 'SUPPORT', rawText: '5:50-6:50 Alt. 2 Seater, Event Cars (60)', confidence: 1 },
  // Sunday (March 15) - Warmup / Race
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'sunday', startTime: '07:00', endTime: '18:30', title: 'Media Center Hours', series: 'GENERAL', rawText: '7:00-6:30 PM Media Center Hours', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'sunday', startTime: '06:00', endTime: '12:10', title: 'INDYCAR Credentials', series: 'GENERAL', rawText: '6:00 AM-12:10 PM INDYCAR Credentials', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'sunday', startTime: '06:30', endTime: '08:00', title: 'Track Inspection Slow! (90)', series: 'GENERAL', rawText: '6:30-8:00 Track Inspection Slow! (90)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'sunday', startTime: '08:00', endTime: '08:45', title: 'GR Cup Race 2 (45)', series: 'SUPPORT', rawText: '8:00-8:45 GR Cup R2 (45)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'sunday', startTime: '09:05', endTime: '09:35', title: 'NTT INDYCAR SERIES Warm-up (30)', series: 'INDYCAR', rawText: '9:05-9:35 NTT INDYCAR SERIES Warm-up (30)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'sunday', startTime: '10:01', endTime: '10:06', title: 'INDY NXT Pre-Race (Intro to DSYE)', series: 'INDY_NXT', rawText: '10:01 Intro to DSYE / 10:06 (est.) GF', confidence: 0.9 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'sunday', startTime: '10:06', endTime: '11:01', title: 'INDY NXT Race (55 mins)', series: 'INDY_NXT', rawText: '10:06-11:01 Race (XX laps or 55 mins)', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'sunday', startTime: '11:15', endTime: '11:30', title: 'Cars to Grid', series: 'INDYCAR', rawText: '11:15 Cars to Grid', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'sunday', startTime: '11:23', endTime: '11:50', title: 'Driver Introductions', series: 'INDYCAR', rawText: '11:23 Driver Introductions', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'sunday', startTime: '11:50', endTime: '11:53', title: 'Colors/Invocation/Anthem', series: 'INDYCAR', rawText: '11:50-11:53 Colors/Invocation/Anthem', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'sunday', startTime: '12:07', endTime: '14:30', title: 'NTT INDYCAR SERIES Race', series: 'INDYCAR', rawText: '12:07 GF, NTT INDYCAR SERIES Race - XX Laps', confidence: 1 },
  { id: generateId(), weekendId: ARLINGTON_ID, day: 'sunday', startTime: '15:00', endTime: '21:00', title: 'INDYCAR Tear Down (est. 6 hours)', series: 'GENERAL', rawText: '3:00-9:00 PM INDYCAR Tear Down estimate 6 hours', confidence: 1 },
];

const seedAllMasterEvents = [
  ...stPeteMasterEvents,
  ...phoenixMasterEvents,
  ...arlingtonMasterEvents,
];

function makeSeedActivities(people: Person[]): Activity[] {
  const getPeople = (dept: DepartmentId) => people.filter((p) => p.departmentId === dept);
  const idOf = (name: string) => people.find((p) => p.name === name)?.id;
  const idsOf = (...names: string[]) => names.map(idOf).filter((id): id is string => !!id);
  const now = new Date().toISOString();

  return [
    // Thursday
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Transporter Setup & Branding',
      departmentIds: ['brand-experiences', 'partnerships'],
      personIds: [...getPeople('brand-experiences').slice(0, 2).map((p) => p.id), ...idsOf('Elizabeth Wood', 'Tanner Higgins')],
      day: 'thursday', startTime: '09:00', endTime: '12:00', location: 'Paddock',
      status: 'confirmed', notes: 'Sponsor signage placement, transporter wrap check, hospitality branding', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Driver Headshots & Portrait Session',
      departmentIds: ['photography', 'drivers'],
      personIds: [...getPeople('photography').map((p) => p.id), ...getPeople('drivers').map((p) => p.id)],
      day: 'thursday', startTime: '13:00', endTime: '15:00', location: 'Garage',
      status: 'confirmed', notes: 'Updated headshots for all three drivers. Stillhouse shooting.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Content Planning Meeting',
      departmentIds: ['social-content', 'photography'],
      personIds: [...getPeople('social-content').map((p) => p.id), ...getPeople('photography').map((p) => p.id)],
      day: 'thursday', startTime: '15:30', endTime: '16:30', location: 'Transporter',
      status: 'confirmed', notes: 'Walk through weekend content plan, shot lists, posting schedule', createdAt: now, updatedAt: now,
    },
    // Friday
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Driver Content Shoot - In-Car Camera Setup',
      departmentIds: ['social-content'],
      personIds: idsOf('Alex Frick', 'Ryan Sawrie'),
      day: 'friday', startTime: '07:30', endTime: '08:30', location: 'Garage',
      status: 'confirmed', notes: 'Setup GoPros and in-car cameras for all three cars before Practice 1', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Fan Zone Setup & Walk-Through',
      departmentIds: ['brand-experiences'],
      personIds: getPeople('brand-experiences').map((p) => p.id),
      day: 'friday', startTime: '08:00', endTime: '11:00', location: 'Fan Zone',
      status: 'confirmed', notes: 'Activation area, photo wall, merch display, simulator setup', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Prospective Client Suite Tour',
      departmentIds: ['sales', 'partnerships'],
      personIds: idsOf('Kyle Moeller', 'Matt Kennedy'),
      day: 'friday', startTime: '11:00', endTime: '12:30', location: 'Hospitality',
      status: 'pending', notes: 'Tour for 3 potential sponsors. Include pit lane access.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Title Sponsor Hospitality Check-In',
      departmentIds: ['partnerships'],
      personIds: idsOf('Matt Kennedy', 'Dan Savka', 'Elizabeth Wood'),
      day: 'friday', startTime: '12:00', endTime: '13:30', location: 'Hospitality',
      status: 'confirmed', notes: 'Ensure sponsor suite setup, signage, and gifts are ready', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Practice 1 Content Coverage',
      departmentIds: ['social-content', 'photography'],
      personIds: [...getPeople('social-content').map((p) => p.id), ...getPeople('photography').map((p) => p.id)],
      day: 'friday', startTime: '13:30', endTime: '15:30', location: 'Pit Lane',
      status: 'confirmed', notes: 'Live coverage of P1. Instagram stories, TikTok, X posts. Stillhouse on pit wall.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Executive Track Walk',
      departmentIds: ['executives'],
      personIds: getPeople('executives').map((p) => p.id),
      day: 'friday', startTime: '16:30', endTime: '17:30', location: 'Track',
      status: 'confirmed', notes: 'Mark, Jill, and Dan walking the facility with track officials', createdAt: now, updatedAt: now,
    },
    // Saturday
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Driver Pre-Qualifying Interview',
      departmentIds: ['social-content', 'drivers'],
      personIds: idsOf('Mark Grainda', 'Alex Frick', 'Will Power'),
      day: 'saturday', startTime: '08:00', endTime: '08:30', location: 'Transporter',
      status: 'confirmed', notes: 'Quick pre-qualifying thoughts with Will. Video + social clips.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'VIP Hospitality Experience',
      departmentIds: ['brand-experiences', 'sales', 'partnerships'],
      personIds: [...getPeople('brand-experiences').slice(0, 2).map((p) => p.id), ...idsOf('Kyle Moeller', 'Matt Kennedy', 'Eric')],
      day: 'saturday', startTime: '10:00', endTime: '14:00', location: 'Hospitality',
      status: 'confirmed', notes: 'Full VIP experience: garage tour, pit lane walk, lunch, qualifying viewing', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Qualifying Content Capture',
      departmentIds: ['social-content', 'photography'],
      personIds: [...getPeople('social-content').map((p) => p.id), ...getPeople('photography').map((p) => p.id)],
      day: 'saturday', startTime: '16:30', endTime: '18:30', location: 'Pit Lane',
      status: 'confirmed', notes: 'All hands on deck for qualifying coverage. Stillhouse pit lane, content team pit wall + garage.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Partner Dinner',
      departmentIds: ['partnerships', 'sales', 'executives'],
      personIds: [...getPeople('partnerships').slice(0, 3).map((p) => p.id), ...idsOf('Kyle Moeller', 'Mark Myers', 'Jill Gregory')],
      day: 'saturday', startTime: '19:00', endTime: '21:30', location: 'Other',
      status: 'pending', notes: 'Dinner with key partners. 12 guests total. Restaurant TBD.', createdAt: now, updatedAt: now,
    },
    // Sunday
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Race Day Content Strategy Meeting',
      departmentIds: ['social-content', 'photography'],
      personIds: [...getPeople('social-content').slice(0, 3).map((p) => p.id), ...getPeople('photography').map((p) => p.id)],
      day: 'sunday', startTime: '07:30', endTime: '08:00', location: 'Transporter',
      status: 'confirmed', notes: 'Align on race day content plan, assign positions for race coverage', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Pre-Race Grid Walk - Sponsors',
      departmentIds: ['partnerships', 'sales', 'brand-experiences', 'executives'],
      personIds: [...getPeople('partnerships').slice(0, 3).map((p) => p.id), ...idsOf('Kyle Moeller'), ...getPeople('brand-experiences').slice(0, 2).map((p) => p.id), ...idsOf('Mark Myers')],
      day: 'sunday', startTime: '11:35', endTime: '12:01', location: 'Grid',
      status: 'confirmed', notes: 'Escort sponsor guests on grid walk. Max 20 guests.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Race Coverage - All Positions',
      departmentIds: ['social-content', 'photography'],
      personIds: [...getPeople('social-content').map((p) => p.id), ...getPeople('photography').map((p) => p.id)],
      day: 'sunday', startTime: '12:15', endTime: '15:00', location: 'Pit Lane',
      status: 'confirmed', notes: 'Full race coverage. Positions: pit wall (Stillhouse), pit lane (Alex F), garage (Ryan), media center (Kylie), fan zone (Devin).', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Post-Race Victory Circle',
      departmentIds: ['social-content', 'photography', 'executives'],
      personIds: [...getPeople('social-content').slice(0, 2).map((p) => p.id), ...getPeople('photography').map((p) => p.id), ...idsOf('Dan Towriss')],
      day: 'sunday', startTime: '14:30', endTime: '15:30', location: 'Victory Circle',
      status: 'pending', notes: 'Depends on race result. If podium, all hands for celebration content.', createdAt: now, updatedAt: now,
    },
    {
      id: generateId(), weekendId: STPETE_ID, name: 'Post-Race Content & Recap',
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
    await db.raceWeekends.bulkAdd(seedWeekends);
    await db.masterEvents.bulkAdd(seedAllMasterEvents);
    await db.people.bulkAdd(seedPeople);

    const storedPeople = await db.people.toArray();
    const activities = makeSeedActivities(storedPeople);
    await db.activities.bulkAdd(activities);
  });
}
