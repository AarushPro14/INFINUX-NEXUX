"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Activity, ArrowDownLeft, ArrowLeft, AudioLines, BriefcaseBusiness, Check, ChevronDown, FileText, Link2, LoaderCircle, MapPin, MessageCircle, Paperclip, Plus, Send, Smile, Sparkles, Sticker, Trash2, Upload, Users, X } from "lucide-react";
import ProfileMenu from "@/components/profile-menu";

type Member = { id: string; name: string | null };
type Message = { id: string; authorId: string; authorName: string; body: string; kind: string; createdAt: string };
type WorkSession = { id: string; name: string; members: Member[]; messages: Message[] };
type Workspace = { id: string; name: string; key: string; sessions: WorkSession[] };
type Props = { user: { id: string; name: string; email: string; image: string | null; role: string }; company: string; staff: { id: string; name: string; email: string }[] };

const icons: Record<string, typeof MessageCircle> = { TEXT: MessageCircle, FILE: FileText, LINK: Link2, LOCATION: MapPin, AUDIO: AudioLines, ACTION: Sparkles };

export default function WorkPageClient({ user, company, staff }: Props) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [loading, setLoading] = useState(true);
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [composer, setComposer] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceKey, setWorkspaceKey] = useState("");
  const [workspacePassword, setWorkspacePassword] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [allStaff, setAllStaff] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [quickReply, setQuickReply] = useState("");
  const [recording, setRecording] = useState(false);
  const [stickerTray, setStickerTray] = useState(false);
  const [emojiTray, setEmojiTray] = useState(false);
  const messageEnd = useRef<HTMLDivElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const audioParts = useRef<BlobPart[]>([]);
  const workspace = workspaces.find(w => w.id === selectedWorkspace) ?? workspaces[0];
  const activeSession = workspace?.sessions.find(s => s.id === selectedSession) ?? workspace?.sessions[0];

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/work", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load your workspaces.");
      const data = await response.json() as { workspaces: Workspace[] };
      setWorkspaces(data.workspaces);
      setSelectedWorkspace(current => data.workspaces.some(w => w.id === current) ? current : data.workspaces[0]?.id ?? "");
      setSelectedSession(current => data.workspaces.some(w => w.sessions.some(s => s.id === current)) ? current : data.workspaces[0]?.sessions[0]?.id ?? "");
      setNotice("");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not load workspaces."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const initial = window.setTimeout(() => void refresh(), 0); const id = window.setInterval(() => void refresh(), 5000); return () => { window.clearTimeout(initial); window.clearInterval(id); }; }, [refresh]);
  useEffect(() => { void fetch("/api/work/replies").then(response => response.ok ? response.json() : null).then(data => { if (Array.isArray(data?.replies)) setQuickReplies(data.replies); }).catch(() => undefined); }, []);
  useEffect(() => { messageEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [activeSession?.messages.length]);

  async function request(path: string, method: string, body: unknown) {
    const response = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Request failed."); return data;
  }
  async function createWorkspace(event: FormEvent) {
    event.preventDefault(); setCreating(true); setNotice("");
    try { await request("/api/work", "POST", { name: workspaceName, key: workspaceKey, password: workspacePassword }); setWorkspaceName(""); setWorkspaceKey(""); setWorkspacePassword(""); setShowWorkspaceForm(false); await refresh(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Could not create workspace."); } finally { setCreating(false); }
  }
  async function createSession(event: FormEvent) {
    event.preventDefault(); if (!workspace) return; setCreating(true);
    try { const data = await request("/api/work", "PATCH", { workspaceId: workspace.id, name: sessionName, staffIds: allStaff ? [] : selectedStaff }); setSessionName(""); setShowSessionForm(false); await refresh(); setSelectedSession(data.session.id); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Could not create session."); } finally { setCreating(false); }
  }
  async function sendMessage(text = composer, kind = "TEXT") {
    if (!activeSession || !text.trim()) return;
    try { await request("/api/work", "PUT", { sessionId: activeSession.id, body: text.trim(), kind }); setComposer(""); await refresh(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Message could not be sent."); }
  }
  async function uploadAttachment(file: File | Blob, sessionId: string, fileName?: string, kind?: "FILE" | "AUDIO") {
    const name = fileName ?? (file instanceof File ? file.name : "voice-message.webm");
    const response = await fetch("/api/work/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, name, mimeType: file.type, size: file.size }) });
    const data = await response.json() as { uploadUrl?: string; path?: string; name?: string; mimeType?: string; size?: number; error?: string };
    if (!response.ok || !data.uploadUrl || !data.path) throw new Error(data.error ?? "Could not prepare this upload.");
    const upload = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": data.mimeType || "application/octet-stream", "x-upsert": "false" }, body: file });
    if (!upload.ok) throw new Error("Supabase could not save this file. Check the bucket’s file size limit and available storage.");
    await sendMessage(JSON.stringify({ path: data.path, name: data.name, mimeType: data.mimeType, size: data.size }), kind ?? (file.type.startsWith("audio/") ? "AUDIO" : "FILE"));
  }
  function submitMessage(event: FormEvent) { event.preventDefault(); void sendMessage(); }
  async function attachFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    if (!activeSession) { setNotice("Open a session before attaching files."); event.target.value = ""; return; }
    setNotice("");
    for (const file of files) {
      try { await uploadAttachment(file, activeSession.id); }
      catch (error) { setNotice(error instanceof Error ? error.message : `Could not upload ${file.name}.`); }
    }
    event.target.value = "";
  }
  async function toggleRecording() {
    if (recording) { recorder.current?.stop(); setRecording(false); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream); recorder.current = media; audioParts.current = [];
      media.ondataavailable = event => { if (event.data.size) audioParts.current.push(event.data); };
      media.onstop = () => { const blob = new Blob(audioParts.current, { type: media.mimeType || "audio/webm" }); if (activeSession) void uploadAttachment(blob, activeSession.id, `voice-${Date.now()}.webm`, "AUDIO").catch(error => setNotice(error instanceof Error ? error.message : "Could not upload voice recording.")); stream.getTracks().forEach(track => track.stop()); };
      media.start(); setRecording(true);
    } catch { setNotice("Enable microphone access to record a voice message."); }
  }
  function shareLocation() {
    if (!navigator.geolocation) { setNotice("Location sharing is unavailable in this browser."); return; }
    navigator.geolocation.getCurrentPosition(position => { const { latitude, longitude } = position.coords; void sendMessage(`Shared location: https://maps.google.com/?q=${latitude},${longitude}`, "LOCATION"); }, () => setNotice("Allow location access to share your location."));
  }
  function insertUrl() { const url = window.prompt("Paste a web link"); if (!url) return; try { const parsed = new URL(url.startsWith("http") ? url : `https://${url}`); setComposer(old => `${old}${old ? " " : ""}${parsed.toString()}`); } catch { setNotice("Enter a valid web address."); } }
  async function saveQuickReply() { const reply = quickReply.trim(); if (!reply) return; const updated = [...quickReplies, reply].slice(-8); setQuickReplies(updated); setQuickReply(""); try { await fetch("/api/work/replies", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ replies: updated }) }); } catch { /* local quick replies remain usable */ } }
  async function removeSession(sessionId: string) { try { await request("/api/work", "DELETE", { sessionId, confirmation: "DELETE" }); await refresh(); } catch (error) { setNotice(error instanceof Error ? error.message : "Could not delete session."); } }

  return <main className="work-app">
    <header className="work-topbar"><div className="work-brand-wrap"><a className="wordmark" href="/continue" aria-label="Return to your workspace">INFINUX <i>NEXUX</i></a><span className="work-brand-divider"/><a className="work-brand-title" href="/work"><span className="work-brand-glyph"><BriefcaseBusiness size={15}/></span><span>WORK<br/><small>TEAM HUB</small></span></a></div><div className="work-top-actions"><span className="work-presence"><i/>{staff.length + 1} team members</span><a className="work-back" href={user.role === "OWNER" ? "/admin" : "/dashboard"}><ArrowLeft size={14}/> Back to dashboard</a><ProfileMenu name={user.name} email={user.email} image={user.image}/></div></header>
    <div className="work-layout">
      <aside className={`work-sidebar ${mobileChat ? "work-sidebar-hidden" : ""}`}>
        <div className="work-side-heading"><div><div className="work-mini-kicker">YOUR ORGANIZATION</div><h1>{company}</h1></div><span className="work-shield">●</span></div>
        <div className="work-side-title"><div><BriefcaseBusiness size={14}/><span>Workspaces</span></div>{user.role === "OWNER" && <button title="Create workspace" onClick={() => setShowWorkspaceForm(true)}><Plus size={16}/></button>}</div>
        {loading ? <div className="work-loading"><LoaderCircle size={17} className="work-spin"/> Loading workspaces…</div> : workspaces.length === 0 ? <div className="work-empty-workspaces"><span className="work-empty-icon"><BriefcaseBusiness size={20}/></span><strong>No workspaces yet</strong><p>{user.role === "OWNER" ? "Create a workspace to start collaborating with your team." : "Your Boss hasn’t created a workspace yet. It will show up here once you’re invited."}</p>{user.role === "OWNER" && <button className="work-primary" onClick={() => setShowWorkspaceForm(true)}><Plus size={15}/> Create workspace</button>}</div> : <div className="work-workspace-list">{workspaces.map(item => <div key={item.id}><button className={`work-workspace-link ${workspace?.id === item.id ? "active" : ""}`} onClick={() => { setSelectedWorkspace(item.id); setSelectedSession(item.sessions[0]?.id ?? ""); }}><span className="work-live-dot"/><span className="work-link-name">{item.name}</span><span className="work-count">{item.sessions.length}</span><ChevronDown size={13}/></button>{workspace?.id === item.id && <div className="work-session-list">{item.sessions.map(session => <button key={session.id} className={`work-session-link ${activeSession?.id === session.id ? "active" : ""}`} onClick={() => { setSelectedSession(session.id); setMobileChat(true); }}><MessageCircle size={14}/><span>{session.name}</span></button>)}{user.role === "OWNER" && <button className="work-add-session" onClick={() => setShowSessionForm(true)}><Plus size={14}/> Create session</button>}</div>}</div>)}</div>}
        <div className="work-sidebar-footer"><div className="work-footer-icon"><Users size={16}/></div><div><strong>Private team space</strong><span>Visible to your organization</span></div><Activity size={14} className="work-footer-activity"/></div>
      </aside>
      <section className={`work-chat ${mobileChat ? "work-chat-mobile" : ""}`}>
        {!activeSession ? <div className="work-chat-empty">{mobileChat && <button className="work-mobile-back" onClick={() => setMobileChat(false)}><ArrowLeft size={15}/> Workspaces</button>}<div className="work-empty-orbit"><MessageCircle size={30}/><span/></div><span className="work-mini-kicker">THE WORKROOM</span><h2>{workspaces.length ? "Make room for good work." : "Your team’s new workroom."}</h2><p>{workspaces.length ? "Choose a session from the sidebar or create one to get your team talking." : user.role === "OWNER" ? "Create a workspace to open a private home for your team’s conversations and collaboration." : "Your team’s conversations and sessions will appear right here once your Boss creates a workspace."}</p>{user.role === "OWNER" && workspaces.length === 0 && <button className="work-primary" onClick={() => setShowWorkspaceForm(true)}><Plus size={15}/> Set up your workspace</button>}{user.role === "OWNER" && workspaces.length > 0 && <button className="work-primary" onClick={() => setShowSessionForm(true)}><Plus size={15}/> Start a session</button>}</div> : <>
          <header className="work-chat-header"><button className="work-mobile-back" onClick={() => setMobileChat(false)}><ArrowLeft size={15}/><span>Workspaces</span></button><span className="work-chat-emblem"><MessageCircle size={18}/></span><div className="work-chat-head-label"><div><span>{workspace?.name}</span><span className="work-breadcrumb-dot">/</span><span className="work-current-breadcrumb">{activeSession.name}</span></div><small><i/> Active session · messages update live</small></div><div className="work-chat-members"><span className="work-avatar-stack">{activeSession.members.slice(0, 3).map((m, i) => <i key={m.id} style={{ zIndex: 3 - i }}>{(m.name ?? "?").slice(0, 1).toUpperCase()}</i>)}</span><span>{activeSession.members.length} members</span><button title="Session members" onClick={() => setNotice(activeSession.members.map(m => m.name).join(", "))}><Users size={16}/></button></div>{user.role === "OWNER" && <button className="work-delete-trigger" title="Delete session" onClick={() => { const typed = window.prompt("Type DELETE to permanently remove this session and all its messages."); if (typed === "DELETE") void removeSession(activeSession.id); }}><Trash2 size={15}/><span>Delete</span></button>}</header>
          <div className="work-message-scroll"><div className="work-session-intro"><div className="work-intro-line"/><div className="work-chat-emblem large"><MessageCircle size={19}/></div><div className="work-mini-kicker">A PRIVATE TEAM SESSION</div><h2>{activeSession.name}</h2><p>{activeSession.members.length} invited {activeSession.members.length === 1 ? "member" : "members"} · {workspace?.name}</p><div className="work-intro-divider"><span>MESSAGES</span></div></div>
            {activeSession.messages.map((message, index) => { const own = message.authorId === user.id; const prev = activeSession.messages[index - 1]; const grouped = prev?.authorId === message.authorId && new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() < 3 * 60 * 1000; const Icon = icons[message.kind] ?? MessageCircle; return <div key={message.id} className={`work-message-row ${own ? "own" : ""} ${grouped ? "grouped" : ""}`}>{!own && !grouped && <span className="work-message-avatar">{message.authorName.slice(0, 1).toUpperCase()}</span>}{!own && grouped && <span className="work-message-avatar ghost"/>}<div className="work-message-content">{!grouped && <div className="work-message-meta"><strong>{own ? "You" : message.authorName}</strong><span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>}<div className={`work-bubble ${own ? "mine" : ""} kind-${message.kind.toLowerCase()}`}>{message.kind !== "TEXT" && <span className="work-kind-icon"><Icon size={14}/>{message.kind === "LOCATION" ? "Shared location" : message.kind === "ACTION" ? "Quick action" : message.kind === "AUDIO" ? "Voice message" : message.kind === "LINK" ? "Web link" : "Attachment"}</span>}{renderBody(message.body)}</div></div>{own && !grouped && <span className="work-message-avatar own-avatar">{user.name.slice(0, 1).toUpperCase()}</span>}</div>; })}
            {activeSession.messages.length === 0 && <div className="work-first-message"><Sparkles size={14}/> This is the beginning of your team session.</div>}<div ref={messageEnd}/>
          </div>
          <div className="work-composer-area">{quickReplies.length > 0 && <div className="work-quick-replies">{quickReplies.map((reply, i) => <button key={`${i}-${reply}`} onClick={() => void sendMessage(reply)}>{reply}</button>)}</div>}<div className="work-composer"><div className="work-composer-tools"><label title="Attach files"><input type="file" multiple onChange={attachFiles} hidden/><Paperclip size={17}/></label><button title="Share link" onClick={insertUrl}><Link2 size={16}/></button><button title="Share location" onClick={shareLocation}><MapPin size={16}/></button><button title="Quick actions" onClick={() => setComposer(old => `${old}${old ? " " : ""}✓ Task completed`)}><Sparkles size={16}/></button><button title="Add emoji" onClick={() => setEmojiTray(value => !value)}><Smile size={16}/></button><button title="Stickers" onClick={() => setStickerTray(value => !value)}><Sticker size={16}/></button><button className={recording ? "recording" : ""} title={recording ? "Stop recording" : "Record voice"} onClick={() => void toggleRecording()}><AudioLines size={16}/></button>{user.role === "OWNER" && <button title="Save a quick reply" onClick={() => { const value = window.prompt("Type a quick reply to save"); if (value) { setQuickReply(value); } }}><Plus size={16}/><span className="work-save-reply-label">Reply</span></button>}</div>{emojiTray && <div className="work-emoji-tray">{["😀","🙌","💡","✅","🎉","👀","🔥","❤️","🙏","🚀","✨","👏"].map(emoji => <button key={emoji} onClick={() => { setComposer(old => old + emoji); setEmojiTray(false); }}>{emoji}</button>)}</div>}{stickerTray && <div className="work-sticker-tray">{["✨ Great work!","🙌 On it!","✅ Done","🚀 Let’s go!"].map(sticker => <button key={sticker} onClick={() => { void sendMessage(sticker, "ACTION"); setStickerTray(false); }}>{sticker}</button>)}</div>}{quickReply && <form className="work-save-reply" onSubmit={event => { event.preventDefault(); void saveQuickReply(); }}><input value={quickReply} onChange={event => setQuickReply(event.target.value)} placeholder="Your quick reply…"/><button className="work-primary" type="submit">Save reply</button><button className="work-icon-button" type="button" onClick={() => setQuickReply("")}><X size={14}/></button></form>}<form className="work-compose-row" onSubmit={submitMessage}><textarea aria-label="Write a message" value={composer} onChange={event => setComposer(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder={recording ? "Recording voice… click the waveform to finish" : `Message #${activeSession.name}`} rows={1}/><span className="work-compose-hint">Enter to send · Shift + Enter for a new line</span><button className="work-send-button" disabled={!composer.trim()} aria-label="Send message"><Send size={16}/></button></form></div><p className="work-encryption-note"><span>◇</span> A focused space for your team to get things done.</p></div>
        </>}
      </section>
      <aside className="work-details-panel"><div className="work-details-heading"><span>SESSION DETAILS</span><button title="Session options" onClick={() => setNotice("Session details") }><Plus size={15}/></button></div>{activeSession ? <><div className="work-details-card"><div className="work-details-symbol"><MessageCircle size={21}/></div><span className="work-mini-kicker">CURRENT SESSION</span><strong>{activeSession.name}</strong><span className="work-details-subtitle">Inside {workspace?.name}</span><div className="work-details-stats"><span><Users size={14}/>{activeSession.members.length} participants</span><span><MessageCircle size={14}/>{activeSession.messages.length} messages</span></div></div><div className="work-members-heading"><span>SESSION MEMBERS</span><span>{activeSession.members.length}</span></div><div className="work-member-list">{activeSession.members.map(member => <div key={member.id}><span className="work-member-avatar">{(member.name ?? "?").slice(0, 1).toUpperCase()}</span><div><strong>{member.id === user.id ? `${member.name} (you)` : member.name}</strong><span>{member.id === activeSession.members[0]?.id && user.role === "OWNER" ? "Boss" : "Team member"}</span></div><i/></div>)}</div><div className="work-workspace-about"><span>ABOUT THIS WORKSPACE</span><strong>{workspace?.name}</strong><p>{company} · Workspace ID <code>{workspace?.key}</code></p><div className="work-about-note"><ArrowDownLeft size={14}/> Your invited team can join as soon as the session is created.</div></div></> : <div className="work-details-empty"><div className="work-empty-icon"><Users size={20}/></div><strong>Room for the team</strong><span>Session details and member information appear here.</span></div>}</aside>
    </div>
    {notice && <div className="work-toast" role="status"><span>{notice}</span><button onClick={() => setNotice("")}><X size={14}/></button></div>}
    {showWorkspaceForm && <div className="work-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowWorkspaceForm(false); }}><form className="work-modal" onSubmit={createWorkspace}><button type="button" className="work-modal-close" onClick={() => setShowWorkspaceForm(false)}><X size={17}/></button><span className="work-modal-symbol"><BriefcaseBusiness size={20}/></span><div className="work-mini-kicker">BOSS WORKSPACE SETUP</div><h2>Create a workspace</h2><p>Give your team a private, organized space to work together.</p><label>Workspace name<input required minLength={2} maxLength={100} value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} placeholder="Product & Design"/></label><label>Workspace ID<input required pattern="[a-zA-Z0-9_-]{3,40}" maxLength={40} value={workspaceKey} onChange={e => setWorkspaceKey(e.target.value)} placeholder="product-design"/><small>3–40 letters, numbers, hyphens, or underscores.</small></label><label>Workspace password<input required minLength={8} maxLength={128} type="password" value={workspacePassword} onChange={e => setWorkspacePassword(e.target.value)} placeholder="At least 8 characters"/><small>Your password is stored securely.</small></label>{notice && <div className="work-form-error">{notice}</div>}<button className="work-primary" disabled={creating}>{creating ? <LoaderCircle size={15} className="work-spin"/> : <Plus size={15}/>} Create workspace</button></form></div>}
    {showSessionForm && <div className="work-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowSessionForm(false); }}><form className="work-modal work-session-modal" onSubmit={createSession}><button type="button" className="work-modal-close" onClick={() => setShowSessionForm(false)}><X size={17}/></button><span className="work-modal-symbol"><MessageCircle size={20}/></span><div className="work-mini-kicker">NEW TEAM SESSION</div><h2>Create a session</h2><p>Invite your team to a dedicated conversation in <strong>{workspace?.name}</strong>.</p><label>Session name<input required minLength={2} maxLength={100} value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="Weekly planning"/></label><div className="work-invite-title"><span>INVITE TEAM MEMBERS</span><span>{staff.length} available</span></div><button type="button" className={`work-invite-option ${allStaff ? "selected" : ""}`} onClick={() => { setAllStaff(true); setSelectedStaff([]); }}><span className="work-check">{allStaff && <Check size={13}/>}</span><span><strong>All active staff</strong><small>Everyone in {company}</small></span><Users size={16}/></button><button type="button" className={`work-invite-option ${!allStaff ? "selected" : ""}`} onClick={() => setAllStaff(false)}><span className="work-check">{!allStaff && <Check size={13}/>}</span><span><strong>Choose specific people</strong><small>Invite only selected staff</small></span><Users size={16}/></button>{!allStaff && <div className="work-staff-picker">{staff.length ? staff.map(person => <label key={person.id}><input type="checkbox" checked={selectedStaff.includes(person.id)} onChange={event => setSelectedStaff(ids => event.target.checked ? [...ids, person.id] : ids.filter(id => id !== person.id))}/><span className="work-member-avatar">{person.name.slice(0, 1).toUpperCase()}</span><span><strong>{person.name}</strong><small>{person.email}</small></span></label>) : <p>There are no active staff members yet.</p>}</div>}{notice && <div className="work-form-error">{notice}</div>}<button className="work-primary" disabled={creating}>{creating ? <LoaderCircle size={15} className="work-spin"/> : <Plus size={15}/>} Create session & invite</button></form></div>}
  </main>;

}

function renderBody(body: string) {
  try {
    const attachment = JSON.parse(body) as { name?: string; mimeType?: string; size?: number; url?: string | null };
    if (attachment.name && attachment.mimeType) {
      if (!attachment.url) return <span className="work-attachment-failed">{attachment.name} · preview expired or unavailable. Refresh to try again.</span>;
      if (attachment.mimeType.startsWith("image/")) return <a className="work-file-card" href={attachment.url} target="_blank" rel="noopener noreferrer"><img className="work-attachment-image" src={attachment.url} alt={attachment.name}/><span>{attachment.name} · {formatSize(attachment.size ?? 0)}</span></a>;
      if (attachment.mimeType.startsWith("audio/")) return <span className="work-file-card"><span>{attachment.name} · {formatSize(attachment.size ?? 0)}</span><audio controls src={attachment.url}/></span>;
      if (attachment.mimeType.startsWith("video/")) return <video className="work-attachment-video" controls src={attachment.url}/>;
      return <a className="work-download-card" href={attachment.url} target="_blank" rel="noopener noreferrer" download={attachment.name}><FileText size={19}/><span><strong>{attachment.name}</strong><small>{formatSize(attachment.size ?? 0)} · Download</small></span><Upload size={14}/></a>;
    }
  } catch { /* normal text message */ }
  const parts = body.split(/(https?:\/\/[^\s]+)/g);
  return <span className="work-message-body">{parts.map((part, i) => /^https?:\/\//.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a> : part)}</span>;
}

function formatSize(size: number) { return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`; }
