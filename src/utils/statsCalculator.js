/**
 * Combat Reflex - Statistics Calculator
 *
 * Provides functions to calculate and format training statistics
 * for session analysis and progress tracking.
 */

/**
 * @typedef {Object} SessionStats
 * @property {number} durationMs - Total session duration in milliseconds
 * @property {string} durationFormatted - Duration formatted as MM:SS
 * @property {number} hitsCompleted - Number of hits completed
 * @property {number} totalHits - Total number of hits for the session
 * @property {number} completionRate - Percentage of hits completed (0-100)
 * @property {number} averagePace - Average time between hits in milliseconds
 * @property {string} averagePaceFormatted - Average pace formatted as seconds
 */

/**
 * Calculates comprehensive statistics for a training session
 * @param {number} startTime - Session start timestamp (ms since epoch)
 * @param {number} endTime - Session end timestamp (ms since epoch)
 * @param {number} hitsCompleted - Number of hits the user completed
 * @param {number} totalHits - Total number of hits for the session
 * @returns {SessionStats} Calculated session statistics
 */
export function calculateSessionStats(startTime, endTime, hitsCompleted, totalHits) {
  const durationMs = endTime - startTime;
  const completionRate = totalHits > 0 ? Math.round((hitsCompleted / totalHits) * 100) : 0;
  const averagePace = hitsCompleted > 1 ? Math.round(durationMs / (hitsCompleted - 1)) : 0;

  return {
    durationMs,
    durationFormatted: formatTime(durationMs),
    hitsCompleted,
    totalHits,
    completionRate,
    averagePace,
    averagePaceFormatted: averagePace > 0 ? (averagePace / 1000).toFixed(2) + 's' : 'N/A'
  };
}

/**
 * Calculates the average pace between hits
 * @param {number} hits - Number of hits completed
 * @param {number} durationMs - Duration in milliseconds
 * @returns {number} Average time between hits in milliseconds (0 if insufficient data)
 */
export function calculateAveragePace(hits, durationMs) {
  // Need at least 2 hits to calculate pace between them
  if (hits < 2 || durationMs <= 0) {
    return 0;
  }
  // Pace is the average time between consecutive hits
  return Math.round(durationMs / (hits - 1));
}

/**
 * Formats milliseconds to MM:SS format
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string (e.g., "02:30")
 */
export function formatTime(ms) {
  if (ms < 0 || !Number.isFinite(ms)) {
    return '00:00';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedMinutes}:${paddedSeconds}`;
}

/**
 * Formats milliseconds to a detailed time string with milliseconds
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string (e.g., "02:30.500")
 */
export function formatTimeDetailed(ms) {
  if (ms < 0 || !Number.isFinite(ms)) {
    return '00:00.000';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  const paddedMs = String(milliseconds).padStart(3, '0');

  return `${paddedMinutes}:${paddedSeconds}.${paddedMs}`;
}

/**
 * Calculates hits per minute rate
 * @param {number} hits - Number of hits completed
 * @param {number} durationMs - Duration in milliseconds
 * @returns {number} Hits per minute (rounded to 1 decimal place)
 */
export function calculateHitsPerMinute(hits, durationMs) {
  if (hits <= 0 || durationMs <= 0) {
    return 0;
  }
  const minutes = durationMs / 60000;
  return Math.round((hits / minutes) * 10) / 10;
}
