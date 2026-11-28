export type EmailLinkType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email';
export function parseEmailLink(params: URLSearchParams): {token_hash:string;type:EmailLinkType}|null {
  const token=params.get('token_hash'),type=params.get('type');
  if(!token || !/^[A-Za-z0-9_-]{32,256}$/.test(token) || !['signup','invite','magiclink','recovery','email_change','email'].includes(type||'')) return null;
  return {token_hash:token,type:type as EmailLinkType};
}
