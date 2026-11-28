import { createServer } from 'node:http';
import { handleAsNodeRequest } from 'cloudflare:node';
import handler from '../server/handler.ts';
import { database } from '../server/runtime.ts';
import { retryPendingNotifications } from '../server/notifications.ts';
import { replenishConsultationSlots } from '../server/scheduling.ts';
import vercelConfig from '../vercel.json';

createServer(handler).listen(8080);
const securityHeaders = vercelConfig.routes.find(route => route.src === '/(.*)' && route.headers).headers;
const redirects = { '/products': '/work', '/capabilities': '/services', '/blog': '/journal' };

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil((async () => {
      const db = database();
      if (controller.cron === '0 0 * * *') await replenishConsultationSlots(db);
      await retryPendingNotifications(db);
    })());
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.capistortechnologies.com') {
      url.hostname = 'capistortechnologies.com';
      return Response.redirect(url.toString(), 308);
    }
    let response;
    if (url.pathname === '/api/commerce') {
      response = await handleAsNodeRequest(8080, request);
    } else if (url.pathname.startsWith('/api/')) {
      response = new Response('Not found', {status: 404});
    } else if (redirects[url.pathname]) {
      response = new Response(null, {status: 308, headers: {Location: redirects[url.pathname] + url.search}});
    } else if (!['GET', 'HEAD'].includes(request.method)) {
      response = new Response('Method not allowed', {status: 405, headers: {Allow: 'GET, HEAD'}});
    } else {
      response = await env.ASSETS.fetch(request);
      // Preserve browser routes, but do not return HTML for missing asset files.
      if (response.status === 404 && !url.pathname.split('/').pop().includes('.')) {
        url.pathname = '/app';
        response = await env.ASSETS.fetch(new Request(url, request));
      }
    }
    const result = new Response(response.body, response);
    for (const [key, value] of Object.entries(securityHeaders)) result.headers.set(key, value);
    if (/^\/(api|portal|admin|staff|login|checkout)(\/|$)/.test(new URL(request.url).pathname)) {
      result.headers.set('Cache-Control', 'private, no-store');
      result.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    if (process.env.DEPLOYMENT_ENV !== 'production' || url.hostname !== 'capistortechnologies.com') result.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return result;
  },
};
