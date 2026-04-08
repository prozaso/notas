import { useState, useRef, useEffect } from "react";

const COLORS = ["#FF3CAC", "#784BA0", "#2B86C5", "#00F5A0", "#F7971E", "#FFD200", "#FF6B6B", "#C850C0"];

const SAMPLE_NOTES = [
  { id: 1, title: "Diseño del sistema", body: "Revisar arquitectura de microservicios. API Gateway → Auth → Services → DB layer con Redis cache.", color: "#FF3CAC", pinned: true, date: "hoy", tag: "trabajo" },
  { id: 2, title: "Lista de compras", body: "Café · Aguacates · Pan artesanal · Leche de avena · Chocolate 85%", color: "#00F5A0", pinned: false, date: "ayer", tag: "personal" },
  { id: 3, title: "Ideas del proyecto", body: "App de notas con gestos, modo focus, sincronización E2E, widgets nativos en home screen.", color: "#FFD200", pinned: true, date: "lun", tag: "ideas" },
  { id: 4, title: "Libro: Atomic Habits", body: "Pequeños cambios → resultados notables. El 1% mejor cada día = 37x mejor en un año.", color: "#2B86C5", pinned: false, date: "dom", tag: "lectura" },
  { id: 5, title: "Workout split", body: "Lun: Push · Mar: Pull · Mié: Legs · Jue: Push · Vie: Pull · Sáb: Full body", color: "#F7971E", pinned: false, date: "sáb", tag: "salud" },
];

const TAGS = ["todos", "trabajo", "personal", "ideas", "lectura", "salud"];

function formatBody(text) {
  return text.split("·").join(" · ");
}

export default function NotesApp() {
  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [activeNote, setActiveNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("todos");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editColor, setEditColor] = useState(COLORS[0]);
  const [editTag, setEditTag] = useState("personal");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [view, setView] = useState("grid"); // grid | list
  const [deleteAnim, setDeleteAnim] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const bodyRef = useRef(null);

  const filtered = notes.filter(n => {
    const matchTag = activeTag === "todos" || n.tag === activeTag;
    const matchSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTag && matchSearch;
  });

  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  function openNote(note) {
    setActiveNote(note);
    setEditTitle(note.title);
    setEditBody(note.body);
    setEditColor(note.color);
    setEditTag(note.tag);
    setIsEditing(false);
    setShowColorPicker(false);
  }

  function newNote() {
    const note = {
      id: Date.now(),
      title: "",
      body: "",
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pinned: false,
      date: "ahora",
      tag: "personal"
    };
    setNotes(prev => [note, ...prev]);
    setActiveNote(note);
    setEditTitle("");
    setEditBody("");
    setEditColor(note.color);
    setEditTag("personal");
    setIsEditing(true);
    setTimeout(() => bodyRef.current?.focus(), 100);
  }

  function saveNote() {
    if (!editTitle.trim() && !editBody.trim()) {
      deleteNote(activeNote.id);
      return;
    }
    setNotes(prev => prev.map(n => n.id === activeNote.id
      ? { ...n, title: editTitle || "Sin título", body: editBody, color: editColor, tag: editTag, date: "ahora" }
      : n
    ));
    setActiveNote(prev => ({ ...prev, title: editTitle || "Sin título", body: editBody, color: editColor, tag: editTag }));
    setIsEditing(false);
  }

  function deleteNote(id) {
    setDeleteAnim(id);
    setTimeout(() => {
      setNotes(prev => prev.filter(n => n.id !== id));
      setActiveNote(null);
      setDeleteAnim(null);
    }, 350);
  }

  function togglePin(id) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    if (activeNote?.id === id) setActiveNote(prev => ({ ...prev, pinned: !prev.pinned }));
  }

  const tagEmoji = { todos: "✦", trabajo: "💼", personal: "🌿", ideas: "⚡", lectura: "📖", salud: "🔥" };

  return (
    <div style={styles.root}>
      {/* Background */}
      <div style={styles.bg} />
      <div style={styles.grain} />

      {/* Mobile frame */}
      <div style={styles.phone}>
        {/* Status bar */}
        <div style={styles.statusBar}>
          <span style={styles.statusTime}>9:41</span>
          <div style={styles.statusIcons}>
            <span style={{ fontSize: 10 }}>▲▲▲</span>
            <span style={{ fontSize: 10 }}>WiFi</span>
            <span style={{ fontSize: 10 }}>⬛</span>
          </div>
        </div>

        {/* Dynamic Island */}
        <div style={styles.island} />

        {/* MAIN VIEW */}
        {!activeNote ? (
          <div style={styles.screen}>
            {/* Header */}
            <div style={styles.header}>
              <div>
                <p style={styles.headerSub}>Mis notas</p>
                <h1 style={styles.headerTitle}>{notes.length} notas</h1>
              </div>
              <button onClick={newNote} style={styles.addBtn}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>+</span>
              </button>
            </div>

            {/* Search */}
            <div style={{ ...styles.searchWrap, ...(searchFocused ? styles.searchWrapFocused : {}) }}>
              <span style={styles.searchIcon}>⌕</span>
              <input
                style={styles.searchInput}
                placeholder="Buscar notas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={styles.clearBtn}>✕</button>
              )}
            </div>

            {/* Tags */}
            <div style={styles.tags}>
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  style={{ ...styles.tagBtn, ...(activeTag === tag ? styles.tagBtnActive : {}) }}
                >
                  {tagEmoji[tag]} {tag}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div style={styles.viewToggle}>
              <button onClick={() => setView("grid")} style={{ ...styles.viewBtn, ...(view === "grid" ? styles.viewBtnActive : {}) }}>⊞</button>
              <button onClick={() => setView("list")} style={{ ...styles.viewBtn, ...(view === "list" ? styles.viewBtnActive : {}) }}>☰</button>
            </div>

            {/* Notes list */}
            <div style={styles.notesList}>
              {pinned.length > 0 && (
                <>
                  <p style={styles.sectionLabel}>📌 Fijadas</p>
                  <div style={view === "grid" ? styles.grid : styles.list}>
                    {pinned.map(note => <NoteCard key={note.id} note={note} view={view} onOpen={openNote} deleteAnim={deleteAnim} />)}
                  </div>
                </>
              )}
              {unpinned.length > 0 && (
                <>
                  {pinned.length > 0 && <p style={styles.sectionLabel}>✦ Todas</p>}
                  <div style={view === "grid" ? styles.grid : styles.list}>
                    {unpinned.map(note => <NoteCard key={note.id} note={note} view={view} onOpen={openNote} deleteAnim={deleteAnim} />)}
                  </div>
                </>
              )}
              {filtered.length === 0 && (
                <div style={styles.empty}>
                  <p style={{ fontSize: 40, marginBottom: 12 }}>✦</p>
                  <p style={styles.emptyText}>Sin notas aquí</p>
                  <p style={styles.emptyHint}>Toca + para crear una</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* NOTE DETAIL / EDIT VIEW */
          <div style={{ ...styles.screen, background: "#0a0a0f", padding: 0 }}>
            {/* Color stripe */}
            <div style={{ ...styles.colorStripe, background: editColor }} />

            {/* Header */}
            <div style={styles.noteHeader}>
              <button onClick={() => { if (isEditing) saveNote(); else setActiveNote(null); }} style={styles.backBtn}>
                {isEditing ? "✓ Guardar" : "← Volver"}
              </button>
              <div style={styles.noteActions}>
                <button onClick={() => togglePin(activeNote.id)} style={styles.iconBtn}>
                  {activeNote.pinned ? "📌" : "☆"}
                </button>
                {!isEditing && (
                  <button onClick={() => { setIsEditing(true); setTimeout(() => bodyRef.current?.focus(), 50); }} style={styles.iconBtn}>✏️</button>
                )}
                <button onClick={() => deleteNote(activeNote.id)} style={styles.iconBtn}>🗑</button>
              </div>
            </div>

            <div style={styles.noteContent}>
              {/* Tag & date */}
              <div style={styles.noteMeta}>
                <span style={{ ...styles.noteTagBadge, background: editColor + "22", color: editColor }}>
                  {tagEmoji[editTag]} {editTag}
                </span>
                <span style={styles.noteDate}>{activeNote.date}</span>
              </div>

              {/* Title */}
              {isEditing ? (
                <input
                  style={styles.titleInput}
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Título..."
                  autoFocus
                />
              ) : (
                <h2 style={styles.noteTitle}>{activeNote.title}</h2>
              )}

              {/* Divider */}
              <div style={{ ...styles.divider, background: editColor }} />

              {/* Body */}
              {isEditing ? (
                <textarea
                  ref={bodyRef}
                  style={styles.bodyInput}
                  value={editBody}
                  onChange={e => setEditBody(e.target.value)}
                  placeholder="Escribe aquí..."
                  rows={10}
                />
              ) : (
                <p style={styles.noteBody}>{activeNote.body}</p>
              )}

              {/* Edit options */}
              {isEditing && (
                <div style={styles.editOptions}>
                  <p style={styles.editLabel}>Color</p>
                  <div style={styles.colorRow}>
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setEditColor(c)}
                        style={{
                          ...styles.colorDot,
                          background: c,
                          transform: editColor === c ? "scale(1.3)" : "scale(1)",
                          boxShadow: editColor === c ? `0 0 12px ${c}` : "none"
                        }}
                      />
                    ))}
                  </div>

                  <p style={styles.editLabel}>Etiqueta</p>
                  <div style={styles.tagRow}>
                    {TAGS.filter(t => t !== "todos").map(t => (
                      <button
                        key={t}
                        onClick={() => setEditTag(t)}
                        style={{
                          ...styles.tagBtn,
                          ...(editTag === t ? { ...styles.tagBtnActive, borderColor: editColor, color: editColor } : {})
                        }}
                      >
                        {tagEmoji[t]} {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom nav */}
        {!activeNote && (
          <div style={styles.bottomNav}>
            <button style={styles.navItem}>🏠</button>
            <button style={styles.navItem}>🔍</button>
            <button onClick={newNote} style={styles.navCenter}>+</button>
            <button style={styles.navItem}>📁</button>
            <button style={styles.navItem}>⚙️</button>
          </div>
        )}

        {/* Home indicator */}
        <div style={styles.homeIndicator} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
        button { cursor: pointer; border: none; background: none; font-family: inherit; }
        input, textarea { font-family: inherit; border: none; outline: none; background: none; resize: none; }
      `}</style>
    </div>
  );
}

function NoteCard({ note, view, onOpen, deleteAnim }) {
  const [pressed, setPressed] = useState(false);
  const isDeleting = deleteAnim === note.id;

  return (
    <div
      onClick={() => onOpen(note)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        ...styles.card,
        ...(view === "list" ? styles.cardList : {}),
        borderColor: note.color + "55",
        transform: pressed ? "scale(0.97)" : isDeleting ? "scale(0.8)" : "scale(1)",
        opacity: isDeleting ? 0 : 1,
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
      }}
    >
      {/* Top accent */}
      <div style={{ ...styles.cardAccent, background: note.color }} />

      {view !== "list" && (
        <div style={{ ...styles.cardColorBlob, background: note.color + "18" }} />
      )}

      <div style={styles.cardInner}>
        <div style={styles.cardTop}>
          <span style={{ ...styles.cardTag, color: note.color }}>{note.tag}</span>
          {note.pinned && <span style={{ fontSize: 10, opacity: 0.6 }}>📌</span>}
        </div>
        <h3 style={styles.cardTitle}>{note.title || "Sin título"}</h3>
        {view !== "list" && (
          <p style={styles.cardBody}>{note.body.slice(0, 80)}{note.body.length > 80 ? "…" : ""}</p>
        )}
        <div style={styles.cardFooter}>
          <span style={styles.cardDate}>{note.date}</span>
          <div style={{ ...styles.cardDot, background: note.color }} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#050508",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Syne', sans-serif",
    padding: "20px 0",
  },
  bg: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(ellipse 80% 80% at 20% 20%, #FF3CAC18 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, #2B86C518 0%, transparent 60%)",
    pointerEvents: "none",
  },
  grain: {
    position: "fixed",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
    opacity: 0.5,
  },
  phone: {
    width: 390,
    height: 844,
    background: "#0a0a0f",
    borderRadius: 54,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)",
    display: "flex",
    flexDirection: "column",
  },
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 28px 0",
    color: "#fff",
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 600,
    zIndex: 10,
    flexShrink: 0,
  },
  statusTime: { fontSize: 15, fontWeight: 700, letterSpacing: "-0.5px" },
  statusIcons: { display: "flex", gap: 6, alignItems: "center", opacity: 0.8 },
  island: {
    width: 126,
    height: 36,
    background: "#000",
    borderRadius: 20,
    margin: "8px auto 0",
    flexShrink: 0,
    position: "relative",
    zIndex: 10,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
  },
  screen: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px",
    color: "#fff",
    position: "relative",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingTop: 8,
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "'DM Mono', monospace",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: "-1.5px",
    lineHeight: 1,
    background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    background: "linear-gradient(135deg, #FF3CAC, #784BA0)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(255,60,172,0.4)",
    transition: "transform 0.2s",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: "12px 16px",
    marginBottom: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "border-color 0.2s",
  },
  searchWrapFocused: {
    borderColor: "rgba(255,60,172,0.5)",
    background: "rgba(255,60,172,0.06)",
  },
  searchIcon: { color: "rgba(255,255,255,0.3)", fontSize: 18, marginRight: 10 },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    "::placeholder": { color: "rgba(255,255,255,0.2)" },
  },
  clearBtn: { color: "rgba(255,255,255,0.3)", fontSize: 12, padding: 4 },
  tags: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    paddingBottom: 4,
    marginBottom: 12,
  },
  tagBtn: {
    flexShrink: 0,
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 600,
    transition: "all 0.2s",
    letterSpacing: "0.3px",
  },
  tagBtnActive: {
    background: "rgba(255,60,172,0.15)",
    borderColor: "rgba(255,60,172,0.5)",
    color: "#FF3CAC",
  },
  viewToggle: {
    display: "flex",
    gap: 4,
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  viewBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.3)",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  viewBtnActive: { background: "rgba(255,255,255,0.14)", color: "#fff" },
  notesList: { paddingBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 4,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 4,
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    border: "1px solid",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
  },
  cardList: {
    borderRadius: 16,
  },
  cardAccent: {
    height: 3,
    width: "100%",
  },
  cardColorBlob: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: "50%",
    filter: "blur(20px)",
  },
  cardInner: {
    padding: "12px 14px 14px",
    position: "relative",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTag: {
    fontSize: 10,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "-0.3px",
    color: "#fff",
    marginBottom: 6,
    lineHeight: 1.3,
  },
  cardBody: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.5,
    marginBottom: 10,
    fontFamily: "'DM Mono', monospace",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardDate: {
    fontSize: 10,
    fontFamily: "'DM Mono', monospace",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: 0.5,
  },
  cardDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    opacity: 0.7,
  },
  empty: {
    textAlign: "center",
    padding: "60px 0",
    color: "rgba(255,255,255,0.2)",
  },
  emptyText: { fontSize: 18, fontWeight: 700, marginBottom: 6 },
  emptyHint: { fontSize: 13, fontFamily: "'DM Mono', monospace" },
  bottomNav: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "12px 16px 8px",
    background: "rgba(10,10,15,0.95)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px)",
    flexShrink: 0,
  },
  navItem: {
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    borderRadius: 14,
    color: "rgba(255,255,255,0.4)",
    transition: "all 0.2s",
  },
  navCenter: {
    width: 56,
    height: 56,
    borderRadius: 18,
    background: "linear-gradient(135deg, #FF3CAC, #784BA0)",
    color: "#fff",
    fontSize: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(255,60,172,0.45)",
    marginTop: -12,
    fontWeight: 300,
    lineHeight: 1,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    background: "rgba(255,255,255,0.25)",
    borderRadius: 3,
    margin: "6px auto 10px",
    flexShrink: 0,
  },
  // Note detail
  colorStripe: {
    height: 4,
    flexShrink: 0,
  },
  noteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px 8px",
    flexShrink: 0,
  },
  backBtn: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 600,
    letterSpacing: "0.5px",
    transition: "color 0.2s",
  },
  noteActions: { display: "flex", gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  noteContent: {
    flex: 1,
    overflowY: "auto",
    padding: "0 20px 20px",
    color: "#fff",
  },
  noteMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  noteTagBadge: {
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    padding: "4px 12px",
    borderRadius: 20,
  },
  noteDate: {
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: 1,
  },
  noteTitle: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-1px",
    lineHeight: 1.2,
    marginBottom: 14,
    color: "#fff",
  },
  divider: {
    height: 2,
    borderRadius: 2,
    marginBottom: 16,
    opacity: 0.4,
  },
  noteBody: {
    fontSize: 16,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.8,
    fontFamily: "'DM Mono', monospace",
    fontStyle: "italic",
    letterSpacing: "0.2px",
  },
  titleInput: {
    width: "100%",
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-1px",
    color: "#fff",
    marginBottom: 14,
    lineHeight: 1.2,
    fontFamily: "'Syne', sans-serif",
  },
  bodyInput: {
    width: "100%",
    fontSize: 15,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.8,
    fontFamily: "'DM Mono', monospace",
    fontStyle: "italic",
    minHeight: 180,
  },
  editOptions: {
    marginTop: 28,
    paddingTop: 20,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  editLabel: {
    fontSize: 10,
    fontFamily: "'DM Mono', monospace",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  colorRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
  },
  tagRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
};
