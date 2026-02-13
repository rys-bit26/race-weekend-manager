// @ts-expect-error pdfmake has no type declarations
import pdfMake from 'pdfmake/build/pdfmake';
// @ts-expect-error pdfmake has no type declarations
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake?.vfs ?? pdfFonts.vfs ?? pdfFonts;

import { DEPARTMENT_MAP, DAYS } from '../../utils/constants';
import { formatTime } from '../../utils/time';
import type { Activity, Person } from '../../types/activity';
import type { MasterScheduleEvent, RaceWeekend } from '../../types/schedule';

export function exportExecutivePdf(
  weekend: RaceWeekend,
  masterEvents: MasterScheduleEvent[],
  activities: Activity[],
  people: Person[]
) {
  const personMap = new Map(people.map((p) => [p.id, p.name]));

  const dayColumns = DAYS.map((day) => {
    const dayMaster = masterEvents
      .filter((e) => e.day === day.id)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const dayActivities = activities
      .filter((a) => a.day === day.id)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const items: { text: string; style?: string; margin?: number[] }[] = [];

    if (dayMaster.length > 0) {
      items.push({
        text: 'TRACK SCHEDULE',
        style: 'sectionHeader',
        margin: [0, 2, 0, 2],
      });
      for (const event of dayMaster) {
        items.push({
          text: `${formatTime(event.startTime)}-${formatTime(event.endTime)}`,
          style: 'timeLabel',
        });
        items.push({
          text: event.title,
          style: 'masterEvent',
          margin: [0, 0, 0, 4],
        });
      }
    }

    if (dayActivities.length > 0) {
      items.push({
        text: 'TEAM ACTIVITIES',
        style: 'sectionHeader',
        margin: [0, 6, 0, 2],
      });
      for (const activity of dayActivities) {
        const deptNames = activity.departmentIds
          .map((d) => DEPARTMENT_MAP[d]?.shortName)
          .join(', ');
        const peopleNames = activity.personIds
          .map((id) => personMap.get(id))
          .filter(Boolean)
          .slice(0, 3)
          .join(', ');
        const status = activity.status === 'confirmed' ? '' : ' [PENDING]';

        items.push({
          text: `${formatTime(activity.startTime)}-${formatTime(activity.endTime)}`,
          style: 'timeLabel',
        });
        items.push({
          text: `${activity.name}${status}`,
          style: 'teamEvent',
        });
        items.push({
          text: `${deptNames} | ${activity.location}${peopleNames ? ` | ${peopleNames}` : ''}`,
          style: 'eventDetail',
          margin: [0, 0, 0, 4],
        });
      }
    }

    return items;
  });

  // Find the max number of items
  const maxItems = Math.max(...dayColumns.map((c) => c.length));

  // Pad columns to equal length
  const paddedColumns = dayColumns.map((col) => {
    while (col.length < maxItems) {
      col.push({ text: '' });
    }
    return col;
  });

  const docDefinition = {
    pageSize: 'LETTER' as const,
    pageOrientation: 'landscape' as const,
    pageMargins: [20, 40, 20, 20] as [number, number, number, number],
    header: {
      text: `${weekend.name} - Schedule`,
      alignment: 'center' as const,
      margin: [0, 15, 0, 0],
      fontSize: 12,
      bold: true,
      color: '#1e293b',
    },
    content: [
      {
        columns: DAYS.map((day, i) => ({
          width: '*' as const,
          stack: [
            {
              text: day.label,
              style: 'dayHeader',
              margin: [0, 0, 0, 4],
            },
            ...paddedColumns[i],
          ],
          margin: i > 0 ? [4, 0, 0, 0] : [0, 0, 0, 0],
        })),
        columnGap: 8,
      },
    ],
    styles: {
      dayHeader: {
        fontSize: 10,
        bold: true,
        color: '#ffffff',
        fillColor: '#1e293b',
        alignment: 'center' as const,
      },
      sectionHeader: {
        fontSize: 7,
        bold: true,
        color: '#64748b',
      },
      timeLabel: {
        fontSize: 6,
        color: '#94a3b8',
      },
      masterEvent: {
        fontSize: 7,
        color: '#475569',
        italics: true,
      },
      teamEvent: {
        fontSize: 7,
        bold: true,
        color: '#0f172a',
      },
      eventDetail: {
        fontSize: 6,
        color: '#94a3b8',
      },
    },
  };

  pdfMake.createPdf(docDefinition).download(`${weekend.name} - Schedule.pdf`);
}
