// Renders the participants panel and exposes handlers for S-1, S-2, S-3.

import type { AppState } from "../state.js";
import { escHtml } from "../utils.js";

// ── Renderer ──────────────────────────────────────────────────────────────

/**
 * Implements S-1, S-2, S-3.
 * Renders the full participants section: the current roster and the
 * add-participant form at the bottom.
 */
export function renderParticipants(state: AppState): string {
  const items = state.participants.map((p) => renderParticipantRow(p, state)).join("");

  return `
    <div class="card" id="section-participants">
      <h2>Participants</h2>
      <div class="participant-list" id="participant-list">
        ${items || `<p class="empty-state">No participants yet. Add one below.</p>`}
      </div>
      <div style="margin-top:1rem">
        ${renderAddForm(state)}
      </div>
    </div>
  `;
}

function renderParticipantRow(
  p: { id: string; name: string },
  state: AppState,
): string {
  const isRenaming = state.renamingId === p.id;
  const removeErr =
    state.removeError?.participantId === p.id
      ? `<div class="inline-error" id="remove-err-${p.id}">${escHtml(state.removeError.message)}</div>`
      : "";

  if (isRenaming) {
    return `
      <div class="participant-row" id="prow-${p.id}">
        <div class="rename-form">
          <input type="text" id="rename-input" value="${escHtml(state.renameInput)}"
            autocomplete="off" aria-label="New name for ${escHtml(p.name)}">
          ${state.renameError ? `<div class="inline-error">${escHtml(state.renameError)}</div>` : ""}
          <button type="button" class="btn btn-primary btn-sm"
            data-action="confirm-rename" data-id="${p.id}">Save</button>
          <button type="button" class="btn btn-ghost btn-sm"
            data-action="cancel-rename">Cancel</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="participant-row" id="prow-${p.id}">
      <span class="participant-name">${escHtml(p.name)}</span>
      <div class="participant-actions">
        <button type="button" class="btn btn-ghost btn-sm"
          data-action="start-rename" data-id="${p.id}">Rename</button>
        <button type="button" class="btn btn-danger btn-sm"
          data-action="remove-participant" data-id="${p.id}">Remove</button>
      </div>
    </div>
    ${removeErr}
  `;
}

function renderAddForm(state: AppState): string {
  return `
    <div class="form-row" id="add-participant-form">
      <div class="form-group">
        <label for="new-participant-name">Add participant</label>
        <input type="text" id="new-participant-name"
          placeholder="Name" value="${escHtml(state.participantInput)}"
          autocomplete="off">
        ${state.participantInputError
          ? `<span class="field-error-msg">${escHtml(state.participantInputError)}</span>`
          : ""}
      </div>
      <button type="button" class="btn btn-primary btn-sm" id="btn-add-participant"
        style="align-self:flex-end;margin-bottom:${state.participantInputError ? "1.35rem" : "0"}">
        Add
      </button>
    </div>
  `;
}

// ── Binder ────────────────────────────────────────────────────────────────

/**
 * Implements S-1, S-2, S-3.
 * Attaches event listeners to participant section elements after render.
 * Called every time the section re-renders.
 *
 * @param onAdd     Handler called with the typed name.
 * @param onRename  Handler called with (participantId, newName).
 * @param onStartRename Handler called with participantId to open rename form.
 * @param onCancelRename Handler called to close rename form.
 * @param onRemove  Handler called with participantId.
 */
export function bindParticipants(handlers: {
  /** Called on every keystroke — just persists value to state, no re-render. */
  onInputChange: (value: string) => void;
  /** Called when the Add button is clicked — validates and adds. */
  onAddClick: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onStartRename: (id: string) => void;
  onCancelRename: () => void;
  onRemove: (id: string) => void;
}): void {
  // Track input value on every keystroke so it survives re-renders caused by
  // other interactions (e.g. opening the expense form) without a full re-render.
  document.getElementById("new-participant-name")?.addEventListener("input", (e) => {
    handlers.onInputChange((e.target as HTMLInputElement).value);
  });

  document.getElementById("btn-add-participant")?.addEventListener("click", () => {
    const input = document.getElementById("new-participant-name") as HTMLInputElement | null;
    handlers.onAddClick(input?.value ?? "");
  });

  // Rename form (appears inline when editing)
  document.querySelectorAll("[data-action='start-rename']").forEach((btn) => {
    (btn as HTMLElement).addEventListener("click", () => {
      handlers.onStartRename((btn as HTMLElement).dataset["id"]!);
    });
  });

  document.querySelectorAll("[data-action='confirm-rename']").forEach((btn) => {
    (btn as HTMLElement).addEventListener("click", () => {
      const input = document.getElementById("rename-input") as HTMLInputElement | null;
      const id = (btn as HTMLElement).dataset["id"]!;
      handlers.onRename(id, input?.value ?? "");
    });
  });

  // Allow Enter key in rename input
  document.getElementById("rename-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const btn = document.querySelector("[data-action='confirm-rename']") as HTMLElement | null;
      btn?.click();
    }
    if (e.key === "Escape") handlers.onCancelRename();
  });

  document.querySelectorAll("[data-action='cancel-rename']").forEach((btn) => {
    (btn as HTMLElement).addEventListener("click", () => handlers.onCancelRename());
  });

  document.querySelectorAll("[data-action='remove-participant']").forEach((btn) => {
    (btn as HTMLElement).addEventListener("click", () => {
      handlers.onRemove((btn as HTMLElement).dataset["id"]!);
    });
  });

  // Allow Enter key in add-participant input (triggers the Add button click)
  document.getElementById("new-participant-name")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btn-add-participant")?.click();
  });
}
