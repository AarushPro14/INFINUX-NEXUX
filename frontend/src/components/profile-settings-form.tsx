"use client";

import { FormEvent, useState } from "react";
import { Check, Save } from "lucide-react";
import { useRouter } from "next/navigation";

const MAX_IMAGE_BYTES = 41_943_040;

export default function ProfileSettingsForm({ initialName, initialImage }: { initialName: string; initialImage: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(initialImage);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(""); setNotice("");
    if (file.size > MAX_IMAGE_BYTES) { setError("Choose an image smaller than 40 MiB."); event.target.value = ""; return; }
    if (!file.type.startsWith("image/")) { setError("Choose a valid image file."); event.target.value = ""; return; }
    setUploading(true);
    try {
      const body = new FormData(); body.set("image", file);
      const response = await fetch("/api/profile", { method: "PUT", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error ?? "Unable to upload your photo."); return; }
      setImage(data.image); setNotice("Profile photo updated."); router.refresh();
    } catch { setError("The photo upload could not reach the server."); }
    finally { setUploading(false); event.target.value = ""; }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error ?? "Unable to update your profile."); return; }
      setName(data.name ?? name); setNotice("Your profile name has been updated.");
    } catch { setError("The profile update could not reach the server."); }
    finally { setBusy(false); }
  }

  return <form className="auth-card form-stack" style={{ maxWidth: 560, marginTop: 20 }} onSubmit={submit}>
    {error && <div className="error-banner" role="alert">{error}</div>}
    {notice && <div className="success-banner" role="status"><Check size={14}/> {notice}</div>}
    <label htmlFor="profile-photo">Profile picture · maximum 40 MiB</label>
    <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={upload} disabled={uploading} />
    {image && <img src={image} alt="Profile picture preview" width={96} height={96} style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid var(--line)" }} />}
    {uploading && <small>Uploading photo…</small>}
    <label htmlFor="profile-name">Display name</label>
    <input id="profile-name" required minLength={2} maxLength={100} value={name} onChange={event => { setName(event.target.value); setNotice(""); }} autoComplete="name" />
    <button className="primary-button" disabled={busy}><Save size={15}/>{busy ? "Saving…" : "Save profile"}</button>
  </form>;
}
