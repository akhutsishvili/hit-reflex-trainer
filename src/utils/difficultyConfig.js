/**
 * Combat Reflex - Difficulty Configuration
 *
 * Defines difficulty levels, training modes, and timing constants
 * for the martial arts reaction training app.
 */

/**
 * @typedef {Object} Difficulty
 * @property {string} id - Unique identifier for the difficulty
 * @property {string} name - Display name for the difficulty
 * @property {number} minInterval - Minimum time between hits in milliseconds
 * @property {number} maxInterval - Maximum time between hits in milliseconds
 * @property {number} totalHits - Total number of hits for a session
 */

/**
 * Available difficulty levels for training sessions
 * @type {Difficulty[]}
 */
export const DIFFICULTIES = [
  {
    id: 'very-easy',
    name: 'Very Easy',
    minInterval: 2500,
    maxInterval: 4000,
    totalHits: 18
  },
  {
    id: 'easy',
    name: 'Easy',
    minInterval: 1500,
    maxInterval: 2500,
    totalHits: 30
  },
  {
    id: 'normal',
    name: 'Normal',
    minInterval: 1000,
    maxInterval: 1800,
    totalHits: 45
  },
  {
    id: 'hard',
    name: 'Hard',
    minInterval: 600,
    maxInterval: 1200,
    totalHits: 68
  },
  {
    id: 'very-hard',
    name: 'Very Hard',
    minInterval: 300,
    maxInterval: 800,
    totalHits: 92
  }
];

/**
 * Generates a random interval within the difficulty's range
 * @param {Difficulty} difficulty - The difficulty configuration object
 * @returns {number} Random interval in milliseconds
 */
export function getRandomInterval(difficulty) {
  const { minInterval, maxInterval } = difficulty;
  return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
}

/**
 * Available training modes (punch/kick selection)
 * @type {string[]}
 */
export const TRAINING_MODES = ['punches', 'kicks', 'both'];

/**
 * Available training types
 * @type {string[]}
 */
export const TRAINING_TYPES = ['single', 'combo'];

/**
 * @typedef {Object} ComboConfig
 * @property {string} id - Matches difficulty ID
 * @property {{min: number, max: number}} comboSize - Number of strikes per combo
 * @property {{min: number, max: number}} strikeInterval - Milliseconds between strikes in combo
 * @property {{min: number, max: number}} restBetweenCombos - Milliseconds rest after combo
 * @property {number} totalCombos - Number of combos per session
 */

/**
 * Combo-specific settings per difficulty level
 * @type {ComboConfig[]}
 */
export const COMBO_SETTINGS = [
  {
    id: 'very-easy',
    comboSize: { min: 1, max: 2 },
    strikeInterval: { min: 600, max: 800 },
    restBetweenCombos: { min: 5000, max: 6000 },
    totalCombos: 9
  },
  {
    id: 'easy',
    comboSize: { min: 1, max: 3 },
    strikeInterval: { min: 500, max: 700 },
    restBetweenCombos: { min: 4000, max: 5000 },
    totalCombos: 12
  },
  {
    id: 'normal',
    comboSize: { min: 1, max: 3 },
    strikeInterval: { min: 400, max: 600 },
    restBetweenCombos: { min: 3000, max: 4000 },
    totalCombos: 15
  },
  {
    id: 'hard',
    comboSize: { min: 1, max: 4 },
    strikeInterval: { min: 300, max: 500 },
    restBetweenCombos: { min: 2000, max: 3000 },
    totalCombos: 17
  },
  {
    id: 'very-hard',
    comboSize: { min: 1, max: 5 },
    strikeInterval: { min: 200, max: 400 },
    restBetweenCombos: { min: 1500, max: 2500 },
    totalCombos: 20
  }
];

/**
 * Gets combo settings for a difficulty
 * @param {string} difficultyId - The difficulty ID
 * @returns {ComboConfig|undefined} Combo settings or undefined
 */
export function getComboSettings(difficultyId) {
  return COMBO_SETTINGS.find(c => c.id === difficultyId);
}

/**
 * Generates a random combo size within the difficulty's range
 * @param {ComboConfig} comboConfig - The combo configuration
 * @returns {number} Number of strikes in the combo
 */
export function getRandomComboSize(comboConfig) {
  const { min, max } = comboConfig.comboSize;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random interval between strikes in a combo
 * @param {ComboConfig} comboConfig - The combo configuration
 * @returns {number} Interval in milliseconds
 */
export function getRandomStrikeInterval(comboConfig) {
  const { min, max } = comboConfig.strikeInterval;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random rest interval between combos
 * @param {ComboConfig} comboConfig - The combo configuration
 * @returns {number} Rest interval in milliseconds
 */
export function getRandomComboRest(comboConfig) {
  const { min, max } = comboConfig.restBetweenCombos;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Duration of a training session in milliseconds (2 minutes)
 * @type {number}
 */
export const SESSION_DURATION_MS = 120000;

/**
 * Duration of break between sessions in milliseconds (30 seconds)
 * @type {number}
 */
export const BREAK_DURATION_MS = 30000;

/**
 * Duration of mid-session rest in milliseconds (7 seconds)
 * @type {number}
 */
export const MID_REST_DURATION_MS = 7000;

/**
 * Default difficulty (Normal)
 * @type {Difficulty}
 */
export const DEFAULT_DIFFICULTY = DIFFICULTIES[2];

/**
 * Default difficulties array (for profile system)
 * Used as reference for creating default profiles
 * @type {Difficulty[]}
 */
export const DEFAULT_DIFFICULTIES = [...DIFFICULTIES];

/**
 * Default combo settings array (for profile system)
 * @type {ComboConfig[]}
 */
export const DEFAULT_COMBO_SETTINGS = [...COMBO_SETTINGS];

/**
 * Default rest settings (for profile system)
 * @type {Object}
 */
export const DEFAULT_REST_SETTINGS = {
  enabled: true,
  breakDuration: BREAK_DURATION_MS
};

/**
 * Gets a difficulty by its ID
 * @param {string} id - The difficulty ID
 * @returns {Difficulty|undefined} The difficulty object or undefined if not found
 */
export function getDifficultyById(id) {
  return DIFFICULTIES.find(d => d.id === id);
}
