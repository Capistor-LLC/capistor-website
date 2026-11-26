import {describe, expect, it} from 'vitest';
import {providerError} from '../server/notifications.js';
describe('email diagnostics', () => {
  it('retains actionable errors without echoing email addresses or credentials', () => {
    const result=providerError(400,{name:'validation_error',message:'Invalid sender person@example.com with Bearer re_secret and sk_test_secret'});
    expect(result).toContain('validation_error');
    expect(result).toContain('Invalid sender');
    expect(result).not.toContain('person@example.com');
    expect(result).not.toContain('re_secret');
    expect(result).not.toContain('sk_test_secret');
    expect(providerError(502,null)).toContain('request_failed');
  });
});
