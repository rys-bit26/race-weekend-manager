import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Download } from 'lucide-react';
import { exportExecutivePdf } from '../../services/pdf-export/PdfExportService';
import type { Activity, Person } from '../../types/activity';
import type { MasterScheduleEvent, RaceWeekend } from '../../types/schedule';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  weekend: RaceWeekend;
  masterEvents: MasterScheduleEvent[];
  activities: Activity[];
  people: Person[];
}

export function ExportDialog({
  open,
  onClose,
  weekend,
  masterEvents,
  activities,
  people,
}: ExportDialogProps) {
  const [includeMaster, setIncludeMaster] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      exportExecutivePdf(
        weekend,
        includeMaster ? masterEvents : [],
        activities,
        people
      );
    } finally {
      setExporting(false);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Export Schedule">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Export the schedule as a PDF document.
        </p>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeMaster}
            onChange={(e) => setIncludeMaster(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">
            Include INDYCAR track schedule
          </span>
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
