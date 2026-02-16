/**
 * HTML email template for activity change notifications.
 */

interface ActivityChangeData {
  activityName: string;
  changes: string[];
  newDay?: string;
  newStartTime?: string;
  newEndTime?: string;
  newStatus?: string;
  location?: string;
  weekendName: string;
}

export function activityChangedEmailHtml(data: ActivityChangeData): string {
  const changeItems = data.changes
    .map((c) => `<li style="margin-bottom: 4px;">${c}</li>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
  <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
    <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #eef2ff; color: #4f46e5; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 8px;">
          Schedule Update
        </div>
        <h1 style="margin: 8px 0 0; font-size: 20px; color: #111827;">
          ${escapeHtml(data.activityName)}
        </h1>
        <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">
          ${escapeHtml(data.weekendName)}
        </p>
      </div>

      <!-- Changes -->
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #92400e;">
          What changed:
        </p>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #78350f;">
          ${changeItems}
        </ul>
      </div>

      <!-- Current Details -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
        <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #374151;">
          Updated Schedule:
        </p>
        <table style="font-size: 14px; color: #4b5563;">
          ${data.newDay ? `<tr><td style="padding: 2px 12px 2px 0; color: #9ca3af;">Day</td><td style="font-weight: 500;">${capitalize(data.newDay)}</td></tr>` : ''}
          ${data.newStartTime ? `<tr><td style="padding: 2px 12px 2px 0; color: #9ca3af;">Time</td><td style="font-weight: 500;">${data.newStartTime} - ${data.newEndTime ?? ''}</td></tr>` : ''}
          ${data.newStatus ? `<tr><td style="padding: 2px 12px 2px 0; color: #9ca3af;">Status</td><td style="font-weight: 500;">${capitalize(data.newStatus)}</td></tr>` : ''}
          ${data.location ? `<tr><td style="padding: 2px 12px 2px 0; color: #9ca3af;">Location</td><td style="font-weight: 500;">${escapeHtml(data.location)}</td></tr>` : ''}
        </table>
      </div>

      <!-- Footer -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          This is an automated notification from Race Weekend Schedule Manager.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
