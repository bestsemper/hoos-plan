"use client";

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { importPlanFromStellicPdf } from '../actions';

type PlanOption = {
  id: string;
  title: string;
};

type Props = {
  plans: PlanOption[];
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Unable to read file as data URL.'));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

export default function ImportPlan({ plans }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'new' | 'overwrite'>('new');
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedPlanLabel = useMemo(() => {
    if (!selectedPlanId) return 'Select plan to overwrite';
    return plans.find((plan) => plan.id === selectedPlanId)?.title ?? 'Select plan to overwrite';
  }, [plans, selectedPlanId]);

  const closeModal = () => {
    setIsOpen(false);
    setMode('new');
    setNewPlanTitle('');
    setSelectedPlanId('');
    setFile(null);
    setError(null);
    setIsPlanDropdownOpen(false);
  };

  const handleImport = () => {
    if (!file) {
      setError('Please choose a Stellic PDF file.');
      return;
    }

    if (mode === 'overwrite' && !selectedPlanId) {
      setError('Please choose a plan to overwrite.');
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const base64DataUrl = await fileToDataUrl(file);
        const result = await importPlanFromStellicPdf({
          pdfBase64: base64DataUrl,
          mode,
          overwritePlanId: mode === 'overwrite' ? selectedPlanId : undefined,
          newPlanTitle: mode === 'new' ? newPlanTitle : undefined,
        });

        if (result?.error) {
          setError(result.error);
          return;
        }

        closeModal();
        router.push('/plan');
        router.refresh();
      } catch {
        setError('Unable to upload file. Please try again.');
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="border border-dashed border-panel-border-strong px-5 py-2.5 rounded-xl hover:bg-hover-bg text-text-primary font-semibold transition-colors cursor-pointer"
      >
        Import Plan
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-panel-bg border border-panel-border rounded-2xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-heading">Import Plan PDF</h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-text-muted hover:text-text-secondary cursor-pointer"
                aria-label="Close import modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-4">
              Upload a Stellic PDF export with your taken/planned courses.
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('new');
                    setIsPlanDropdownOpen(false);
                  }}
                  className={`px-3 py-2 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${mode === 'new' ? 'bg-uva-blue/90 text-white border-uva-blue' : 'border-panel-border-strong text-text-primary hover:bg-hover-bg'}`}
                >
                  Make New Plan
                </button>
                <button
                  type="button"
                  onClick={() => setMode('overwrite')}
                  className={`px-3 py-2 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${mode === 'overwrite' ? 'bg-uva-blue/90 text-white border-uva-blue' : 'border-panel-border-strong text-text-primary hover:bg-hover-bg'}`}
                >
                  Overwrite Existing
                </button>
              </div>

              {mode === 'new' && (
                <input
                  type="text"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  placeholder="Optional new plan name"
                  className="w-full px-3 py-2 border border-panel-border rounded-xl bg-input-bg text-text-primary outline-none"
                />
              )}

              {mode === 'overwrite' && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsPlanDropdownOpen((prev) => !prev)}
                    onBlur={() =>
                      setTimeout(() => {
                        setIsPlanDropdownOpen(false);
                      }, 150)
                    }
                    className="w-full px-4 py-2.5 border border-panel-border rounded-xl bg-input-bg text-text-primary text-left cursor-pointer flex items-center justify-between hover:border-panel-border-strong transition-colors"
                  >
                    <span className="truncate text-sm font-medium">{selectedPlanLabel}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isPlanDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                  </button>

                  {isPlanDropdownOpen && (
                    <div className="absolute z-10 mt-1.5 w-full rounded-xl border border-panel-border bg-panel-bg shadow-lg overflow-hidden">
                      <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5">
                      {plans.length === 0 && (
                        <div className="px-3 py-2 text-sm text-text-secondary">No plans available to overwrite.</div>
                      )}
                      {plans.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => {
                            setSelectedPlanId(plan.id);
                            setIsPlanDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm rounded-lg cursor-pointer transition-colors ${selectedPlanId === plan.id ? 'bg-uva-blue/10 text-uva-blue font-semibold' : 'text-text-primary hover:bg-hover-bg'}`}
                        >
                          {plan.title}
                        </button>
                      ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-text-primary file:mr-3 file:px-3 file:py-2 file:border file:border-panel-border-strong file:rounded file:bg-panel-bg-alt file:text-text-primary file:cursor-pointer"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-500 px-3 py-2 rounded-xl text-sm font-semibold">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleImport}
                disabled={isPending || (mode === 'overwrite' && plans.length === 0)}
                className="w-full px-4 py-2 bg-uva-orange/90 text-white rounded-xl hover:bg-uva-orange font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Importing...' : 'Import From PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
