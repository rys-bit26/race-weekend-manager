import { useState, useCallback } from 'react';
import { Modal } from '../common/Modal';
import {
  Upload,
  FileText,
  AlertTriangle,
  Check,
  Trash2,
  Calendar,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { parsePdf } from '../../services/pdf-parser/PdfParserService';
import { parseDepartmentFile } from '../../services/import-parser/DepartmentParserService';
import { api } from '../../lib/api';
import { formatTime } from '../../utils/time';
import { SERIES_COLORS, DEPARTMENTS } from '../../utils/constants';
import type { PdfParseResult, ParsedScheduleEvent } from '../../types/pdf';
import type { MasterScheduleEvent } from '../../types/schedule';
import type { ImportType, ParsedDepartmentItem, DepartmentParseResult } from '../../types/import';
import type { DepartmentId } from '../../types/activity';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  weekendId: string;
}

type ImportStep = 'type-select' | 'dept-select' | 'upload' | 'parsing' | 'preview' | 'done';

export function ImportDialog({ open, onClose, weekendId }: ImportDialogProps) {
  const [step, setStep] = useState<ImportStep>('type-select');
  const [importType, setImportType] = useState<ImportType | null>(null);
  const [selectedDepts, setSelectedDepts] = useState<DepartmentId[]>([]);

  // INDYCAR path state
  const [pdfResult, setPdfResult] = useState<PdfParseResult | null>(null);
  const [pdfEvents, setPdfEvents] = useState<ParsedScheduleEvent[]>([]);

  // Department path state
  const [deptResult, setDeptResult] = useState<DepartmentParseResult | null>(null);
  const [deptItems, setDeptItems] = useState<ParsedDepartmentItem[]>([]);

  const [importing, setImporting] = useState(false);

  // ──── File Handling ────

  const handleFile = useCallback(
    async (file: File) => {
      setStep('parsing');

      const buffer = await file.arrayBuffer();
      const isExcel = /\.xlsx?$/i.test(file.name);

      try {
        if (importType === 'indycar-schedule') {
          const parseResult = await parsePdf(buffer);
          setPdfResult(parseResult);
          setPdfEvents(parseResult.events);
        } else {
          const parseResult = await parseDepartmentFile(
            buffer,
            isExcel ? 'xlsx' : 'pdf'
          );
          setDeptResult(parseResult);
          setDeptItems(parseResult.items);
        }
        setStep('preview');
      } catch {
        if (importType === 'indycar-schedule') {
          setPdfResult({
            events: [],
            warnings: ['Failed to read the file.'],
            pageCount: 0,
            rawItemCount: 0,
          });
        } else {
          setDeptResult({
            items: [],
            warnings: ['Failed to read the file.'],
            pageCount: 0,
            rawItemCount: 0,
          });
        }
        setStep('preview');
      }
    },
    [importType]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // ──── Import Handlers ────

  const handleIndycarImport = async () => {
    setImporting(true);
    try {
      // bulkCreate on the API replaces all existing master events for this weekend
      const masterEvents = pdfEvents.map((e) => ({
        day: e.day,
        startTime: e.startTime,
        endTime: e.endTime,
        title: e.title,
        series: e.inferredSeries,
        rawText: e.rawLines.join(' '),
        confidence: e.confidence,
      }));

      await api.masterEvents.bulkCreate(weekendId, masterEvents);
      setStep('done');
    } finally {
      setImporting(false);
    }
  };

  const handleDeptImport = async () => {
    setImporting(true);
    try {
      // Create each activity via the API
      const promises = deptItems.map((item) =>
        api.activities.create(weekendId, {
          name: item.name,
          departmentIds: selectedDepts,
          personIds: [],
          day: item.day,
          startTime: item.startTime,
          endTime: item.endTime,
          location: '',
          status: 'pending',
          notes: '',
        })
      );

      await Promise.all(promises);
      setStep('done');
    } finally {
      setImporting(false);
    }
  };

  // ──── Navigation ────

  const handleBack = () => {
    if (step === 'dept-select') {
      setStep('type-select');
      setImportType(null);
    } else if (step === 'upload') {
      if (importType === 'department-schedule') {
        setStep('dept-select');
      } else {
        setStep('type-select');
        setImportType(null);
      }
    } else if (step === 'preview') {
      setStep('upload');
      setPdfResult(null);
      setPdfEvents([]);
      setDeptResult(null);
      setDeptItems([]);
    }
  };

  const handleClose = () => {
    setStep('type-select');
    setImportType(null);
    setSelectedDepts([]);
    setPdfResult(null);
    setPdfEvents([]);
    setDeptResult(null);
    setDeptItems([]);
    onClose();
  };

  const toggleDept = (id: DepartmentId) => {
    setSelectedDepts((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  // ──── Title ────

  const titles: Record<ImportStep, string> = {
    'type-select': 'Import Schedule',
    'dept-select': 'Select Department(s)',
    'upload': importType === 'indycar-schedule' ? 'Import INDYCAR Schedule' : 'Import Department Schedule',
    'parsing': 'Parsing...',
    'preview': importType === 'indycar-schedule' ? 'Review INDYCAR Schedule' : 'Review Department Activities',
    'done': 'Import Complete',
  };

  // Determine item count for done screen
  const importedCount =
    importType === 'indycar-schedule' ? pdfEvents.length : deptItems.length;

  const acceptTypes =
    importType === 'department-schedule'
      ? '.pdf,.xlsx,.xls'
      : '.pdf';

  return (
    <Modal open={open} onClose={handleClose} title={titles[step]} wide={step === 'preview'}>

      {/* ── Step: Type Selection ── */}
      {step === 'type-select' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setImportType('indycar-schedule');
              setStep('upload');
            }}
            className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <Calendar size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold font-heading text-gray-800">INDYCAR Color Schedule</p>
              <p className="text-xs text-gray-500 mt-1">
                Track schedule PDF from INDYCAR. Replaces the master schedule for this event.
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              setImportType('department-schedule');
              setStep('dept-select');
            }}
            className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold font-heading text-gray-800">Department Schedule</p>
              <p className="text-xs text-gray-500 mt-1">
                Department-specific PDF or Excel. Creates team activity records.
              </p>
            </div>
          </button>
        </div>
      )}

      {/* ── Step: Department Selection ── */}
      {step === 'dept-select' && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Select which department(s) these activities belong to.
          </p>

          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => toggleDept(dept.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedDepts.includes(dept.id)
                    ? 'ring-2 ring-offset-1'
                    : 'opacity-50 hover:opacity-75'
                }`}
                style={{
                  backgroundColor: dept.bgColor,
                  color: dept.color,
                }}
              >
                {dept.name}
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              onClick={() => setStep('upload')}
              disabled={selectedDepts.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Step: Upload ── */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-400 transition-colors"
          >
            <Upload size={40} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              {importType === 'indycar-schedule'
                ? 'Drag and drop the INDYCAR schedule PDF here'
                : 'Drag and drop a department schedule PDF or Excel file here'}
            </p>
            <p className="text-sm text-gray-400 mb-4">or</p>
            <label className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
              Choose File
              <input
                type="file"
                accept={acceptTypes}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
            {importType === 'department-schedule' && (
              <p className="text-xs text-gray-400 mt-4">
                Supports .pdf, .xlsx, and .xls files
              </p>
            )}
          </div>

          <div className="flex justify-start">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        </div>
      )}

      {/* ── Step: Parsing ── */}
      {step === 'parsing' && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Parsing schedule...</p>
        </div>
      )}

      {/* ── Step: Preview (INDYCAR) ── */}
      {step === 'preview' && importType === 'indycar-schedule' && pdfResult && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
            <FileText size={20} className="text-gray-400" />
            <div className="text-sm">
              <span className="font-medium text-gray-700">
                {pdfEvents.length} events found
              </span>
              <span className="text-gray-400 ml-2">
                from {pdfResult.pageCount} page(s)
              </span>
            </div>
          </div>

          {pdfResult.warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 bg-amber-50 text-amber-700 text-sm p-3 rounded-lg"
            >
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              {w}
            </div>
          ))}

          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Day</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Time</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Event</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Series</th>
                  <th className="px-3 py-2 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pdfEvents.map((event, i) => (
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
                        onClick={() =>
                          setPdfEvents((prev) => prev.filter((_, idx) => idx !== i))
                        }
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

          <div className="flex justify-between pt-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleIndycarImport}
                disabled={pdfEvents.length === 0 || importing}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {importing ? 'Importing...' : `Import ${pdfEvents.length} Events`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step: Preview (Department) ── */}
      {step === 'preview' && importType === 'department-schedule' && deptResult && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
            <FileText size={20} className="text-gray-400" />
            <div className="text-sm">
              <span className="font-medium text-gray-700">
                {deptItems.length} activities found
              </span>
              <span className="text-gray-400 ml-2">
                &rarr; {selectedDepts.map((id) =>
                  DEPARTMENTS.find((d) => d.id === id)?.name
                ).filter(Boolean).join(', ')}
              </span>
            </div>
          </div>

          {deptResult.warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 bg-amber-50 text-amber-700 text-sm p-3 rounded-lg"
            >
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              {w}
            </div>
          ))}

          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Day</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Time</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Activity Name</th>
                  <th className="px-3 py-2 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deptItems.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-600 capitalize whitespace-nowrap">
                      {item.day.slice(0, 3)}
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                      {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          setDeptItems((prev) =>
                            prev.map((it, idx) =>
                              idx === i ? { ...it, name: e.target.value } : it
                            )
                          )
                        }
                        className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none text-sm text-gray-800 font-medium"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() =>
                          setDeptItems((prev) => prev.filter((_, idx) => idx !== i))
                        }
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

          <div className="flex justify-between pt-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeptImport}
                disabled={deptItems.length === 0 || importing}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {importing ? 'Importing...' : `Import ${deptItems.length} Activities`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step: Done ── */}
      {step === 'done' && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-green-600" />
          </div>
          <p className="text-gray-800 font-medium font-heading mb-1">Import Complete!</p>
          <p className="text-sm text-gray-500 mb-6">
            {importedCount}{' '}
            {importType === 'indycar-schedule' ? 'events have been added to the master schedule.' : 'activities have been added to the team schedule.'}
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
