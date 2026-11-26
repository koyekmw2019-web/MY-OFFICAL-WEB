import {
  signup,
  login,
  logout,
  getUser,
  getSettings,
  handleAuthCallback,
  acceptInvite,
  requestPasswordRecovery,
  updateUser,
  refreshSession,
  confirmEmail,
  recoverPassword
} from '@netlify/identity';

const api = {
  signup,
  login,
  logout,
  getUser,
  getSettings,
  acceptInvite,
  requestPasswordRecovery,
  updateUser,
  refreshSession,
  lastCallback: null
};

const isQaSetup = location.origin === 'https://yekun-ordinary-second-qa.netlify.app'
  && location.pathname === '/assets/qa-identity-setup-v7902.html';
if (isQaSetup) Object.assign(api, { confirmEmail, recoverPassword });
window.YKIdentity = api;
window.dispatchEvent(new CustomEvent('yk-identity-ready'));

(async () => {
  try {
    // QA setup explicitly redeems pasted email tokens only after submit.
    if (isQaSetup) return;
    // Required for invite, confirmation, recovery and email-change links.
    const result = await handleAuthCallback();
    if (!result) return;
    api.lastCallback = result;
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    window.dispatchEvent(new CustomEvent('yk-identity-callback', { detail: result }));
  } catch (error) {
    window.dispatchEvent(new CustomEvent('yk-identity-error', {
      detail: { message: error instanceof Error ? error.message : String(error) }
    }));
  }
})();
