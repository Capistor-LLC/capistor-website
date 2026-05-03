// Facebook Pixel tracking utility
declare global {
  interface Window {
    fbq: (command: string, event: string, data?: Record<string, any>) => void;
  }
}

export const trackFacebookEvent = (
  eventName: string,
  data?: Record<string, any>
) => {
  if (window.fbq) {
    fbq(eventName === 'PageView' ? 'track' : 'track', eventName, data);
  }
};

export const trackFormSubmission = (formType: string = 'Lead') => {
  trackFacebookEvent(formType, {
    value: 0,
    currency: 'AED',
  });
};

export const trackContactFormSubmit = () => {
  trackFacebookEvent('Lead', {
    form_type: 'contact_form',
  });
};
