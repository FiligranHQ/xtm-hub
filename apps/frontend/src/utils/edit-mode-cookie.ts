// Shared between the /edition and /edition/exit route handlers (which set
// and clear it) and EditModeProvider (which reads it client-side). Not
// httpOnly on purpose: EditModeProvider needs to read it via document.cookie.
export const EDIT_MODE_COOKIE_NAME = 'xtm-edit-mode';
