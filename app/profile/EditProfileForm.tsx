"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCurrentUserProfile } from '../actions';

type EditProfileFormProps = {
  displayName: string;
  major: string | null;
  gradYear: number | null;
  bio: string | null;
};

export default function EditProfileForm({
  displayName,
  major,
  gradYear,
  bio,
}: EditProfileFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formDisplayName, setFormDisplayName] = useState(displayName);
  const [formMajor, setFormMajor] = useState(major ?? '');
  const [formGradYear, setFormGradYear] = useState(gradYear ? String(gradYear) : '');
  const [formBio, setFormBio] = useState(bio ?? '');

  const handleCancel = () => {
    setFormDisplayName(displayName);
    setFormMajor(major ?? '');
    setFormGradYear(gradYear ? String(gradYear) : '');
    setFormBio(bio ?? '');
    setError(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    setError(null);

    startTransition(async () => {
      const res = await updateCurrentUserProfile({
        displayName: formDisplayName,
        major: formMajor,
        gradYear: formGradYear,
        bio: formBio,
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      setIsEditing(false);
      router.refresh();
    });
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="bg-uva-blue/90 text-white px-5 py-2.5 rounded-xl hover:bg-uva-blue font-bold transition-colors cursor-pointer"
      >
        Edit Profile
      </button>
    );
  }

  return (
    <div className="w-full max-w-md border border-panel-border rounded-xl p-4 bg-panel-bg-alt">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">Display Name</label>
          <input
            type="text"
            value={formDisplayName}
            onChange={(e) => setFormDisplayName(e.target.value)}
            className="w-full p-2.5 border border-panel-border rounded-xl bg-input-bg text-text-primary outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">Major</label>
          <input
            type="text"
            value={formMajor}
            onChange={(e) => setFormMajor(e.target.value)}
            className="w-full p-2.5 border border-panel-border rounded-xl bg-input-bg text-text-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">Graduation Year</label>
          <input
            type="number"
            value={formGradYear}
            onChange={(e) => setFormGradYear(e.target.value)}
            className="w-full p-2.5 border border-panel-border rounded-xl bg-input-bg text-text-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">Bio</label>
          <textarea
            value={formBio}
            onChange={(e) => setFormBio(e.target.value)}
            rows={3}
            className="w-full p-2.5 border border-panel-border rounded-xl bg-input-bg text-text-primary outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-danger-text text-sm font-semibold mt-3">{error}</p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="bg-uva-blue/90 text-white px-4 py-2 rounded-xl font-semibold hover:bg-uva-blue transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="border border-panel-border-strong px-4 py-2 rounded-xl font-semibold text-text-primary hover:bg-hover-bg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
