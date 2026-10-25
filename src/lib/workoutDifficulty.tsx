/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Exercise, TrainingDay } from '../types';
import { Shield, Zap, Flame, Check } from 'lucide-react';

export type ExerciseDifficultyLevel =
  | 'Beginner (Reduced volume)'
  | 'Intermediate (As listed)'
  | 'Advanced (Added intensity)';

export const DIFFICULTY_LEVELS: ExerciseDifficultyLevel[] = [
  'Beginner (Reduced volume)',
  'Intermediate (As listed)',
  'Advanced (Added intensity)'
];

export interface AdjustedExerciseDetails {
  sets: number;
  repsOrDuration: string;
  restSeconds: number;
  tempo: string;
  coachingCue: string;
  intensityNote: string;
  levelBadge: {
    label: string;
    sublabel: string;
    colorClasses: string;
  };
}

/**
 * Calculates modified sets, reps, rest, and plain-English "Slow and Controlled" cues
 * for each difficulty setting without any technical fitness jargon.
 */
export function getAdjustedExercise(
  exercise: Exercise,
  difficulty: ExerciseDifficultyLevel
): AdjustedExerciseDetails {
  const baseSets = exercise.sets || 3;
  const baseRest = exercise.restSeconds || 60;
  const baseReps = exercise.repsOrDuration || '10-12 reps';
  
  // Strictly enforce simple "Slow and controlled" instructions across all exercises
  const pace = exercise.tempo?.toLowerCase().includes('hold')
    ? 'Slow and controlled hold'
    : 'Slow and controlled';

  if (difficulty === 'Beginner (Reduced volume)') {
    const reducedSets = Math.max(1, baseSets - 1);
    const increasedRest = baseRest + 20;

    let reducedReps = baseReps;
    if (baseReps.toLowerCase().includes('second')) {
      const match = baseReps.match(/(\d+)/);
      if (match) {
        const sec = parseInt(match[1], 10);
        reducedReps = `${Math.max(15, sec - 15)} seconds (gentle hold)`;
      } else {
        reducedReps = '20–30 seconds';
      }
    } else if (baseReps.includes('-')) {
      const match = baseReps.match(/(\d+)\s*-\s*(\d+)/);
      if (match) {
        const low = parseInt(match[1], 10);
        const high = parseInt(match[2], 10);
        reducedReps = `${Math.max(5, low - 2)}–${Math.max(6, high - 2)} reps (bodyweight/light)`;
      }
    } else {
      const match = baseReps.match(/(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        reducedReps = `${Math.max(5, val - 3)} reps (bodyweight/light)`;
      }
    }

    return {
      sets: reducedSets,
      repsOrDuration: reducedReps,
      restSeconds: increasedRest,
      tempo: pace,
      coachingCue: `Slow and controlled. Focus on steady breathing, smooth motion, and good spine posture. Stop early if your muscles get tired.`,
      intensityNote: 'Reduced volume (-1 set, lighter resistance) with generous recovery rest. Slow and controlled pace.',
      levelBadge: {
        label: 'Beginner',
        sublabel: 'Reduced vol',
        colorClasses: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      }
    };
  }

  if (difficulty === 'Advanced (Added intensity)') {
    const addedSets = baseSets + 1;
    const reducedRest = Math.max(30, baseRest - 15);

    let increasedReps = baseReps;
    if (baseReps.toLowerCase().includes('second')) {
      const match = baseReps.match(/(\d+)/);
      if (match) {
        const sec = parseInt(match[1], 10);
        increasedReps = `${sec + 15} seconds (extended hold)`;
      } else {
        increasedReps = '45–60 seconds (extended hold)';
      }
    } else if (baseReps.includes('-')) {
      const match = baseReps.match(/(\d+)\s*-\s*(\d+)/);
      if (match) {
        const low = parseInt(match[1], 10);
        const high = parseInt(match[2], 10);
        increasedReps = `${low + 2}–${high + 3} reps (2s hold at top)`;
      }
    } else {
      const match = baseReps.match(/(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        increasedReps = `${val + 3} reps (2s hold at top)`;
      }
    }

    return {
      sets: addedSets,
      repsOrDuration: increasedReps,
      restSeconds: reducedRest,
      tempo: pace,
      coachingCue: `Slow and controlled. Squeeze your muscles firmly at the top for 2 seconds, then lower down slowly with complete control.`,
      intensityNote: 'Added intensity (+1 set, 2-sec hold at top) with strict rest discipline. Slow and controlled pace.',
      levelBadge: {
        label: 'Advanced',
        sublabel: '+Intensity',
        colorClasses: 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/40'
      }
    };
  }

  // Intermediate (As listed)
  const rawCue = exercise.coachingCue ? exercise.coachingCue.replace('AJ Risner: ', '').replace(/^"|"$/g, '') : '';
  const intermediateCue = rawCue.toLowerCase().includes('slow')
    ? rawCue
    : `Slow and controlled. ${rawCue || 'Move with smooth posture and continuous control.'}`;

  return {
    sets: baseSets,
    repsOrDuration: baseReps,
    restSeconds: baseRest,
    tempo: pace,
    coachingCue: intermediateCue,
    intensityNote: 'Standard volume as listed by Coach AJ Risner. Slow and controlled pace.',
    levelBadge: {
      label: 'Intermediate',
      sublabel: 'As listed',
      colorClasses: 'bg-sky-500/20 text-sky-400 border-sky-500/40'
    }
  };
}

/**
 * Creates a modified clone of a TrainingDay where each exercise
 * is updated according to the driver's chosen difficulty settings.
 */
export function buildAdjustedTrainingDay(
  day: TrainingDay,
  difficultyMap: Record<string, ExerciseDifficultyLevel>,
  defaultLevel: ExerciseDifficultyLevel = 'Intermediate (As listed)'
): TrainingDay {
  return {
    ...day,
    exercises: day.exercises.map((ex) => {
      const level = difficultyMap[ex.id] || defaultLevel;
      const adjusted = getAdjustedExercise(ex, level);
      return {
        ...ex,
        sets: adjusted.sets,
        repsOrDuration: adjusted.repsOrDuration,
        restSeconds: adjusted.restSeconds,
        tempo: adjusted.tempo,
        coachingCue: adjusted.coachingCue
      };
    })
  };
}

interface DifficultyToggleProps {
  currentLevel: ExerciseDifficultyLevel;
  onChange: (level: ExerciseDifficultyLevel) => void;
  size?: 'sm' | 'md';
}

/**
 * Reusable Difficulty Toggle UI component for switching between
 * 'Beginner (Reduced volume)', 'Intermediate (As listed)', and 'Advanced (Added intensity)'
 * Designed with a rigid 3-column grid so no intensity level button can break or overflow the box.
 */
export const DifficultyToggle: React.FC<DifficultyToggleProps> = ({
  currentLevel,
  onChange,
  size = 'md'
}) => {
  const isSm = size === 'sm';

  return (
    <div className="w-full max-w-full overflow-hidden bg-[#0B0E14] p-1 rounded-xl border border-[#202735] shadow-inner">
      <div className="grid grid-cols-3 gap-1 w-full min-w-0">
        {/* Beginner */}
        <button
          type="button"
          onClick={() => onChange('Beginner (Reduced volume)')}
          className={`w-full min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg font-tactical transition font-bold truncate text-center ${
            isSm ? 'px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px]' : 'px-2 sm:px-3 py-1.5 text-xs'
          } ${
            currentLevel === 'Beginner (Reduced volume)'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161D27]'
          }`}
          title="Beginner (Reduced volume): 1 fewer set, lighter resistance, longer rest"
        >
          <Shield className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${currentLevel === 'Beginner (Reduced volume)' ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className="truncate">Beginner</span>
          {currentLevel === 'Beginner (Reduced volume)' && (
            <Check className="w-3 h-3 shrink-0 text-emerald-400 hidden xs:inline" />
          )}
        </button>

        {/* Intermediate */}
        <button
          type="button"
          onClick={() => onChange('Intermediate (As listed)')}
          className={`w-full min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg font-tactical transition font-bold truncate text-center ${
            isSm ? 'px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px]' : 'px-2 sm:px-3 py-1.5 text-xs'
          } ${
            currentLevel === 'Intermediate (As listed)'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161D27]'
          }`}
          title="Intermediate (As listed): Standard sets, reps, and rest as prescribed"
        >
          <Zap className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${currentLevel === 'Intermediate (As listed)' ? 'text-sky-400' : 'text-slate-500'}`} />
          <span className="truncate">Intermediate</span>
          {currentLevel === 'Intermediate (As listed)' && (
            <Check className="w-3 h-3 shrink-0 text-sky-400 hidden xs:inline" />
          )}
        </button>

        {/* Advanced */}
        <button
          type="button"
          onClick={() => onChange('Advanced (Added intensity)')}
          className={`w-full min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg font-tactical transition font-bold truncate text-center ${
            isSm ? 'px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px]' : 'px-2 sm:px-3 py-1.5 text-xs'
          } ${
            currentLevel === 'Advanced (Added intensity)'
              ? 'bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161D27]'
          }`}
          title="Advanced (Added intensity): +1 set, peak hold, strict rest"
        >
          <Flame className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${currentLevel === 'Advanced (Added intensity)' ? 'text-[#FF6B00]' : 'text-slate-500'}`} />
          <span className="truncate">Advanced</span>
          {currentLevel === 'Advanced (Added intensity)' && (
            <Check className="w-3 h-3 shrink-0 text-[#FF6B00] hidden xs:inline" />
          )}
        </button>
      </div>
    </div>
  );
};
