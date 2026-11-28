import {describe,expect,it}from'vitest';import {parseEmailLink}from'../src/commerce/emailLink.js';
describe('branded email confirmation',()=>{
 it('only accepts supported email verification types',()=>{const hash='a'.repeat(64);expect(parseEmailLink(new URLSearchParams({type:'recovery',token_hash:hash}))).toEqual({type:'recovery',token_hash:hash});for(const type of ['sms','https://evil.invalid','', 'recovery&next=//evil.invalid'])expect(parseEmailLink(new URLSearchParams({type,token_hash:hash}))).toBeNull();});
 it('rejects missing, malformed and oversized tokens',()=>{for(const token_hash of ['', 'short','a'.repeat(257),'<script>'+ 'a'.repeat(50)])expect(parseEmailLink(new URLSearchParams({type:'signup',token_hash}))).toBeNull();});
});
