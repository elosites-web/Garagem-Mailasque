import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateSwipeGesture,
  isInteractiveSwipeTarget,
} from '../src/components/LightboxModal';

describe('Lightbox Touch Event Handling & Gesture Evaluation', () => {
  test('1. Detects leftward horizontal swipe as "next" media navigation', () => {
    const result = evaluateSwipeGesture({
      deltaX: -65,
      deltaY: 10,
      durationMs: 220,
    });

    assert.equal(result.isSwipe, true);
    assert.equal(result.direction, 'next');
    assert.equal(result.deltaX, -65);
    assert.ok(result.velocity > 0);
  });

  test('2. Detects rightward horizontal swipe as "prev" media navigation', () => {
    const result = evaluateSwipeGesture({
      deltaX: 70,
      deltaY: 8,
      durationMs: 200,
    });

    assert.equal(result.isSwipe, true);
    assert.equal(result.direction, 'prev');
    assert.equal(result.deltaX, 70);
  });

  test('3. Rejects vertical dragging to preserve scrolling and avoid false media switching', () => {
    const result = evaluateSwipeGesture({
      deltaX: 12,
      deltaY: 95,
      durationMs: 250,
    });

    assert.equal(result.isSwipe, false);
    assert.equal(result.direction, null);
  });

  test('4. Rejects diagonal gestures where horizontal dominance ratio is not satisfied', () => {
    // deltaX 45 vs deltaY 42 -> absX is not > absY * 1.2
    const result = evaluateSwipeGesture({
      deltaX: -45,
      deltaY: 42,
      durationMs: 180,
    });

    assert.equal(result.isSwipe, false);
    assert.equal(result.direction, null);
  });

  test('5. Rejects micro-movements or accidental taps below distance threshold', () => {
    const result = evaluateSwipeGesture({
      deltaX: 15,
      deltaY: 3,
      durationMs: 500,
    });

    assert.equal(result.isSwipe, false);
    assert.equal(result.direction, null);
  });

  test('6. Detects fast flick ("flick gesture") with short duration and moderate distance', () => {
    const result = evaluateSwipeGesture({
      deltaX: -30,
      deltaY: 4,
      durationMs: 90, // Fast flick ~0.33 px/ms
    });

    assert.equal(result.isSwipe, true);
    assert.equal(result.direction, 'next');
  });

  test('7. Handles zero delta gracefully without errors', () => {
    const result = evaluateSwipeGesture({
      deltaX: 0,
      deltaY: 0,
      durationMs: 100,
    });

    assert.equal(result.isSwipe, false);
    assert.equal(result.direction, null);
    assert.equal(result.velocity, 0);
  });

  test('8. isInteractiveSwipeTarget identifies interactive controls that must not be hijacked by swipe', () => {
    // Mock DOM elements with closest method
    const mockButton = {
      closest: (selector: string) => (selector.includes('button') ? {} : null),
    } as unknown as EventTarget;

    const mockVideo = {
      closest: (selector: string) => (selector.includes('video') ? {} : null),
    } as unknown as EventTarget;

    const mockLink = {
      closest: (selector: string) => (selector.includes('a') ? {} : null),
    } as unknown as EventTarget;

    const mockRegularDiv = {
      closest: () => null,
    } as unknown as EventTarget;

    assert.equal(isInteractiveSwipeTarget(mockButton), true);
    assert.equal(isInteractiveSwipeTarget(mockVideo), true);
    assert.equal(isInteractiveSwipeTarget(mockLink), true);
    assert.equal(isInteractiveSwipeTarget(mockRegularDiv), false);
    assert.equal(isInteractiveSwipeTarget(null), false);
  });
});
