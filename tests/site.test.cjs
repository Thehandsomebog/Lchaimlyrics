const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');

function runtime(overrides = {}) {
    const events = [];
    const context = {
        URL, URLSearchParams, console,
        document: { addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; } },
        window: { location: { origin: 'https://lchaimlyrics.com' }, requestAnimationFrame(fn) { fn(); } },
        gtag: (...args) => events.push(args), ...overrides
    };
    vm.createContext(context);
    vm.runInContext(code, context);
    return { context, events };
}

test('both JavaScript files parse without dependencies', () => {
    new vm.Script(code);
    new vm.Script(fs.readFileSync(path.join(root, 'js/languages.js'), 'utf8'));
});

test('an arbitrary thank-you URL cannot report a purchase', () => {
    const { context, events } = runtime({
        document: { addEventListener() {}, querySelector() { return { classList: { add() {} } }; } },
        window: { location: { search: '?plan=essential&value=1&session_id=fake' }, requestAnimationFrame(fn) { fn(); } }
    });
    context.initThankYouPage();
    context.initThankYouPage();
    assert.deepEqual(events, []);
    assert.equal(context.trackThankYouPurchase, undefined);
    assert.equal(context.ensureThankYouTransactionId, undefined);
});

test('only known package aliases are accepted', () => {
    const { context } = runtime();
    assert.equal(context.getSongPlan('simcha').key, 'simcha-special');
    assert.equal(context.getSongPlan("L’Dor V’Dor").key, 'ldor-vdor');
    assert.equal(context.getSongPlan('attacker@email.example').known, false);
});

test('questionnaire URLs only allow same-origin or HTTPS Tally', () => {
    const { context } = runtime();
    for (const url of ['javascript:alert(1)', 'https://evil.example', 'http://tally.so/r/a', 'https://tally.so.evil.example']) {
        assert.equal(context.sanitizeQuestionnaireUrl(url), '');
    }
    assert.equal(context.sanitizeQuestionnaireUrl('https://tally.so/r/QK7l77'), 'https://tally.so/r/QK7l77');
});

test('direct brief clicks are tracked without personal data', () => {
    const handlers = {};
    const link = { href: 'https://tally.so/r/QK7l77?plan=essential&email=private@example.com', dataset: {},
        hasAttribute() { return false; }, addEventListener(event, fn) { handlers[event] = fn; } };
    const { context, events } = runtime({ document: { addEventListener() {}, querySelectorAll() { return [link]; } } });
    context.initFunnelTracking(); handlers.click();
    assert.equal(events[0][1], 'questionnaire_started');
    assert.equal(events[0][2].plan, 'essential');
    assert.ok(!JSON.stringify(events).includes('private@'));
});

test('smooth scroll respects reduced motion and focuses the destination', () => {
    let handler, scroll, focused = false;
    const target = { hasAttribute() { return true; }, focus() { focused = true; }, getBoundingClientRect() { return { top: 300 }; } };
    const anchor = { addEventListener(event, fn) { handler = fn; }, getAttribute() { return '#main-content'; } };
    const { context } = runtime({
        document: { addEventListener() {}, querySelectorAll() { return [anchor]; }, getElementById() { return target; }, querySelector() { return { offsetHeight: 80 }; } },
        window: { scrollY: 0, matchMedia() { return { matches: true }; }, history: { pushState() {} }, scrollTo(value) { scroll = value; } }
    });
    context.initSmoothScroll(); handler.call(anchor, { preventDefault() {} });
    assert.equal(scroll.behavior, 'auto'); assert.equal(focused, true);
});

function audioFixture(fail = false) {
    const attrs = new Map(), handlers = {}, progress = { style: {}, value: 0, setAttribute() {}, addEventListener() {} };
    const time = { textContent: '0:00' };
    const status = { className: '', textContent: '', setAttribute() {} };
    const card = { classList: { toggle() {} }, append() {}, querySelector(s) { return s === '.progress-input' ? progress : time; } };
    const button = { dataset: { audio: 'sample.mp3', title: 'Public sample', sampleId: 'public-demo' },
        classList: { toggle() {} }, closest() { return card; }, querySelector() { return {}; },
        setAttribute(k, v) { attrs.set(k, v); }, removeAttribute(k) { attrs.delete(k); }, hasAttribute(k) { return attrs.has(k); },
        addEventListener(k, fn) { handlers[k] = fn; } };
    const audios = [];
    class Audio {
        constructor() { this.paused = true; this.events = {}; audios.push(this); }
        addEventListener(k, fn) { this.events[k] = fn; }
        async play() { if (fail) throw Error('offline'); this.paused = false; }
        pause() { this.paused = true; this.events.pause?.(); }
    }
    const { context, events } = runtime({ Audio, document: { addEventListener() {}, createElement() { return status; }, querySelectorAll(s) { return s === '.play-btn' ? [button] : []; } } });
    context.initAudioPlayers();
    return { handlers, attrs, status, audios, events };
}

test('failed audio restores play state and gives an accessible error', async () => {
    const f = audioFixture(true); await f.handlers.click();
    assert.equal(f.attrs.get('aria-pressed'), 'false');
    assert.equal(f.attrs.has('aria-busy'), false);
    assert.match(f.status.textContent, /could not play/);
    assert.deepEqual(f.events, []);
});

test('successful audio plays, pauses, and reports the sample only once', async () => {
    const f = audioFixture(); await f.handlers.click();
    assert.equal(f.attrs.get('aria-pressed'), 'true');
    await f.handlers.click(); assert.equal(f.attrs.get('aria-pressed'), 'false');
    await f.handlers.click(); assert.equal(f.events.length, 1);
});

test('native samples pause one another and only report one play each', () => {
    const makePlayer = id => ({ dataset: { sampleId: id }, events: {}, paused: false,
        pause() { this.paused = true; }, addEventListener(event, fn) { this.events[event] = fn; } });
    const a = makePlayer('chuppah'), b = makePlayer('henna');
    const { context, events } = runtime({ document: { addEventListener() {},
        querySelectorAll(selector) { return selector === 'audio' ? [a, b] : []; } } });
    context.initAudioPlayers(); a.events.play(); a.events.play();
    assert.equal(b.paused, true); assert.equal(events.length, 1);
    b.events.play(); assert.equal(a.paused, true); assert.equal(events.length, 2);
});

test('mobile navigation closes on Escape and restores toggle focus', () => {
    const attrs = new Map(), panelAttrs = new Map(), handlers = {};
    let open = false, focused = false;
    const panel = { id: '', setAttribute(k, v) { panelAttrs.set(k, v); }, toggleAttribute(k, v) { panelAttrs.set(k, v); } };
    const toggle = { setAttribute(k, v) { attrs.set(k, v); }, addEventListener(k, fn) { handlers[k] = fn; }, focus() { focused = true; } };
    const nav = { classList: { toggle(k, v) { open = v; }, contains() { return open; } },
        querySelector() { return panel; }, querySelectorAll() { return []; }, addEventListener() {}, contains() { return false; } };
    const { context } = runtime({ document: { addEventListener(k, fn) { if (k === 'keydown') handlers[k] = fn; },
        querySelector(selector) { return selector === '.nav' ? nav : toggle; } }, window: { addEventListener() {} } });
    context.initMobileNav(); handlers.click(); assert.equal(attrs.get('aria-expanded'), 'true');
    handlers.keydown({ key: 'Escape' }); assert.equal(attrs.get('aria-expanded'), 'false');
    assert.equal(panelAttrs.get('inert'), true); assert.equal(focused, true);
});
