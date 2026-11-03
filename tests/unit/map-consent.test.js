import { beforeEach, describe, expect, it } from 'vitest';

let importId = 0;
const importFresh = () => import(/* @vite-ignore */ `../../js/map-consent.js?test=${importId += 1}`);

describe('map consent', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    delete window.getEsterTranslation;
  });

  it('does nothing when the consent block is absent', async () => {
    const { initMapConsent } = await importFresh();
    expect(() => initMapConsent()).not.toThrow();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('loads no iframe until the visitor clicks, then swaps the block for the map', async () => {
    document.body.innerHTML = '<div id="map-consent"><button id="map-consent-btn">ok</button></div>';
    window.getEsterTranslation = () => 'Carte';
    const { initMapConsent } = await importFresh();
    initMapConsent();
    expect(document.querySelector('iframe')).toBeNull();

    document.getElementById('map-consent-btn').click();
    const frame = document.querySelector('iframe.contact-map-frame');
    expect(frame.src).toContain('google.com/maps');
    expect(frame.title).toBe('Carte');
    expect(document.getElementById('map-consent')).toBeNull();
  });

  it('falls back to a default title without the translation helper', async () => {
    document.body.innerHTML = '<div id="map-consent"><button id="map-consent-btn">ok</button></div>';
    const { initMapConsent } = await importFresh();
    initMapConsent();
    document.getElementById('map-consent-btn').click();
    expect(document.querySelector('iframe').title).toBe('Google Maps');
  });
});
