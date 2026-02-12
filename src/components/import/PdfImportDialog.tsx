import { useState, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Upload, FileText, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { parsePdf } from '../../services/pdf-parser/PdfParserService';
import { db } from '../../db/database';
import { generateId } from '../../utils/id';
import { formatTime } from '../../utils/time';
import { SERIES_COLORS } from '../../utils/constants';
import type { PdfParseResult, ParsedScheduleEvent } from '../../types/pdf';
import type { MasterScheduleEvent } from '../../types/schedule';

interface PdfImportDialogProps {
  open: boolean;
  onClose: () => void;
  weekendId: string;
}

type Step = 'upload' | 'parsing' | 'preview' | 'done';

export function PdfImportDialog({ open, onClose, weekendId }: PdfImportDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [result, setResult] = useState<PdfParseResult | null>(null);
  const [events, setEvents] = useState<ParsedScheduleEvent[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setStep('parsing');
      try {
        const buffer = await file.arrayBuffer();
        const parseResult = await parsePdf(buffer);
        setResult(parseResult);
        setEvents(parseResult.events);
        setStep('preview');
      } catch {
        setResult({
          events: [],
          warnings: ['Failed to read the PDF file.'],
          pageCount: 0,
          rawItemCount: 0,
        });
        setStep('preview');
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleImport = async () => {
    setImporting(true);
    try {
      // Clear existing master events for this weekend
      const existing = await db.masterEvents
        .where('weekendId')
        .equals(weekendId)
        .toArray();
      await db.masterEvents.bulkDelete(existing.map((e) => e.id));

      // Add new events
      const masterEvents: MasterScheduleEvent[] = events.map((e) => ({
        id: generateId(),
        weekendId,
        day: e.day,
        startTime: e.startTime,
        endTime: e.endTime,
        title: e.title,
        series: e.inferredSeries,
        rawText: e.rawLines.join(' '),
        confidence: e.confidence,
      }));

      await db.masterEvents.bulkAdd(masterEvents);
      setStep('done');
    } catch {
      // Error handling
    } finally {
      setImporting(false);
    }
  };

  const removeEvent = (index: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setStep('upload');
    setResult(null);
    setEvents([]);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Import INDYCAR Schedule" wide>
      {step === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-400 transition-colors"
        >
          <Upload size={40} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">
            Drag and drop the INDYCAR schedule PDF here
          </p>
          <p className="text-sm text-gray-400 mb-4">or</p>
          <label className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
            Choose File
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        </div>
      )}

      {step === 'parsing' && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Parsing schedule...</p>
        </div>
      )}

      {step === 'preview' && result && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
            <FileText size={20} className="text-gray-400" />
            <div className="text-sm">
              <span className="font-medium text-gray-700">
                {events.length} events found
              </span>
              <span className="text-gray-400 ml-2">
                from {result.pageCount} page(s)
              </span>
            </div>
          </div>

          {/* Warnings */}
          {result.warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 bg-amber-50 text-amber-700 text-sm p-3 rounded-lg"
            >
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              {w}
            </div>
          ))}

          {/* Events table */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">
                    Day
                  </th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">
                    Time
                  </th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">
                    Event
                  </th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">
                    Series
                  </th>
                  <th className="px-3 py-2 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-600 capitalize whitespace-nowrap">
                      {event.day.slice(0, 3)}
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </td>
                    <td className="px-3 py-2 text-gray-800 font-medium">
                      {event.title}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                        style={{
                          backgroundColor:
                            SERIES_COLORS[event.inferredSeries] || SERIES_COLORS.GENERAL,
                        }}
                      >
                        {event.inferredSeries}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeEvent(i)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={events.length === 0 || importing}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${events.length} Events`}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-green-600" />
          </div>
          <p className="text-gray-800 font-medium mb-1">Import Complete!</p>
          <p className="text-sm text-gray-500 mb-6">
            {events.length} events have been added to the schedule.
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}
