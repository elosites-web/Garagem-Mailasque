import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGalleryOverflow,
  calculateScrollProgress,
  calculateStickyHeight,
} from '../src/utils/gallery-scroll';
import {
  galleryPhotosList,
  galleryVideosList,
  galleryAllSlides,
  GalleryPhoto,
  GalleryVideo,
} from '../src/data/gallery';

describe('Gallery Captions & Data Integrity', () => {
  test('1. Both team photos have short accurate caption "Equipe Garagem Mailasque"', () => {
    const equipe1 = galleryPhotosList.find((p) => p.id === 'equipe-1') as GalleryPhoto;
    const equipe2 = galleryPhotosList.find((p) => p.id === 'equipe-2') as GalleryPhoto;

    assert.ok(equipe1, 'equipe-1 must exist');
    assert.ok(equipe2, 'equipe-2 must exist');
    assert.equal(equipe1.caption, 'Equipe Garagem Mailasque');
    assert.equal(equipe2.caption, 'Equipe Garagem Mailasque');
    assert.equal(equipe1.alt, 'Equipe Garagem Mailasque');
    assert.equal(equipe2.alt, 'Equipe Garagem Mailasque');
  });

  test('2. Parking area photo has caption "Estacionamento"', () => {
    const parking = galleryPhotosList.find((p) => p.id === 'estacionamento') as GalleryPhoto;
    assert.ok(parking);
    assert.equal(parking.caption, 'Estacionamento');
    assert.equal(parking.alt, 'Estacionamento');
  });

  test('3. Reception area photo has caption "Recepção"', () => {
    const reception = galleryPhotosList.find((p) => p.id === 'recepcao') as GalleryPhoto;
    assert.ok(reception);
    assert.equal(reception.caption, 'Recepção');
    assert.equal(reception.alt, 'Recepção');
  });

  test('4. Paint booth photo has short accurate caption "Estufa de pintura"', () => {
    const paintBooth = galleryPhotosList.find((p) => p.id === 'estufa-pintura') as GalleryPhoto;
    assert.ok(paintBooth);
    assert.equal(paintBooth.caption, 'Estufa de pintura');
    assert.equal(paintBooth.alt, 'Estufa de pintura');
  });

  test('5. All video items have title "Profissional trabalhando" and no promotional descriptions', () => {
    assert.equal(galleryVideosList.length, 6, 'Must contain 6 videos');
    for (const video of galleryVideosList) {
      assert.equal(video.type, 'video');
      assert.equal(video.title, 'Profissional trabalhando');
      assert.equal(video.description, '', 'Must not contain promotional descriptions');
    }
  });

  test('6. galleryAllSlides combines photos and videos sequentially', () => {
    assert.equal(
      galleryAllSlides.length,
      galleryPhotosList.length + galleryVideosList.length
    );
  });
});

describe('Vertical Scroll-Driven Horizontal Gallery Calculation', () => {
  test('1. calculateGalleryOverflow returns exact overflow difference when track exceeds container', () => {
    const overflow = calculateGalleryOverflow({
      trackScrollWidth: 3200,
      containerVisibleWidth: 1200,
    });
    assert.equal(overflow, 2000);
  });

  test('2. calculateGalleryOverflow returns 0 when content fits in container', () => {
    const overflow = calculateGalleryOverflow({
      trackScrollWidth: 800,
      containerVisibleWidth: 1000,
    });
    assert.equal(overflow, 0);
  });

  test('3. calculateScrollProgress returns 0 when section has not reached viewport top (rectTop > 0)', () => {
    const progress = calculateScrollProgress({
      rectTop: 350,
      totalScrollable: 2000,
    });
    assert.equal(progress, 0);
  });

  test('4. calculateScrollProgress maps vertical scroll accurately to horizontal ratio (0 to 1)', () => {
    // 25% scrolled
    const p25 = calculateScrollProgress({
      rectTop: -500,
      totalScrollable: 2000,
    });
    assert.equal(p25, 0.25);

    // 50% scrolled
    const p50 = calculateScrollProgress({
      rectTop: -1000,
      totalScrollable: 2000,
    });
    assert.equal(p50, 0.5);

    // 100% scrolled (final item revealed)
    const p100 = calculateScrollProgress({
      rectTop: -2000,
      totalScrollable: 2000,
    });
    assert.equal(p100, 1.0);
  });

  test('5. calculateScrollProgress clamps to 1 after user scrolls past totalScrollable (clean release)', () => {
    const pastEnd = calculateScrollProgress({
      rectTop: -2400,
      totalScrollable: 2000,
    });
    assert.equal(pastEnd, 1.0);
  });

  test('6. calculateScrollProgress reverses naturally when scrolling upward', () => {
    const goingUp1 = calculateScrollProgress({
      rectTop: -1500,
      totalScrollable: 2000,
    });
    const goingUp2 = calculateScrollProgress({
      rectTop: -750,
      totalScrollable: 2000,
    });

    assert.equal(goingUp1, 0.75);
    assert.equal(goingUp2, 0.375);
    assert.ok(goingUp2 < goingUp1, 'Progress decreases when scrolling up');
  });

  test('7. calculateStickyHeight returns viewport + scroll distance or auto when reduced-motion is active', () => {
    const normalHeight = calculateStickyHeight({
      viewportHeight: 900,
      scrollDistance: 1800,
      isReducedMotion: false,
    });
    assert.equal(normalHeight, '2700px');

    const reducedMotionHeight = calculateStickyHeight({
      viewportHeight: 900,
      scrollDistance: 1800,
      isReducedMotion: true,
    });
    assert.equal(reducedMotionHeight, 'auto');

    const zeroOverflowHeight = calculateStickyHeight({
      viewportHeight: 900,
      scrollDistance: 0,
      isReducedMotion: false,
    });
    assert.equal(zeroOverflowHeight, 'auto');
  });
});
