import{describe,it,expect}from'vitest';import{SessionStore}from'./session-store.js'
describe('SessionStore',()=>{it('syncs panic and reset',()=>{const s=new SessionStore();expect(s.apply('x',{type:'panic'}).status).toBe('panic');expect(s.apply('x',{type:'reset'}).status).toBe('idle')})})
