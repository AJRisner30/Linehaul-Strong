import { DockDrill } from '../types';

export const DOCK_DOOR_DRILLS: DockDrill[] = [
  {
    id: 'drill-1',
    title: 'Mudflap & ICC Bumper Mobility Flush',
    locationContext: 'Beside Trailer / Dock Bay',
    durationMinutes: 6,
    focus: 'Decompress lower back, open hip flexors, activate glutes',
    intensity: 'Active Mobility & Decompression',
    description:
      'Engineered for drivers sitting at shipping docks waiting for the red light to turn green. Uses the ICC bumper bar and trailer frame to restore back comfort in 6 quick minutes.',
    exercises: [
      {
        name: 'ICC Bumper Hip Hinge & Back Stretch',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Hands flat on rear trailer ICC bumper bar',
        cue: 'AJ Risner: "Push your hips far back like you are trying to tap the warehouse wall behind you. Let your head relax between your arms to take tension out of your neck."'
      },
      {
        name: 'Trailer Skirt Deep Squat Hold',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Asphalt beside drive tires, light fingertips on trailer skirt',
        cue: 'AJ Risner: "Sink your hips down between your ankles. Hold still and breathe. Feel your hips open up after 4 hours of steering wheel sitting."'
      },
      {
        name: 'Cab Door Frame Chest & Shoulder Stretch',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Driver door frame or grab rail',
        cue: 'AJ Risner: "Grip the door frame with elbows high. Step forward and turn your chest open. Squeeze your shoulder blades back to kill that rounded steering-wheel slouch."'
      },
      {
        name: 'Trailer Landing Gear Leg Swings',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Landing gear frame for balance',
        cue: 'AJ Risner: "Swing your leg smoothly forward and back, then side to side. This lubricates stiff hip joints and releases tight driving muscles."'
      },
      {
        name: 'Standing Quad Pull & Reach',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Trailer side panel for balance',
        cue: 'AJ Risner: "Grab your ankle behind your glute and reach your other hand up tall. Feel the front of your hip and thigh stretch."'
      },
      {
        name: 'Bumper Calf Stretch & Ankle Pump',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'ICC bumper or tire step',
        cue: 'AJ Risner: "Drive your heel down flat into the blacktop. Essential for preventing pedal cramps and stiff ankles."'
      }
    ]
  },
  {
    id: 'drill-2',
    title: 'The Green Light Rapid Energy Blast',
    locationContext: 'Cab Step & ICC Bumper',
    durationMinutes: 8,
    focus: 'Max blood circulation, rapid conditioning, zero floor contact',
    intensity: 'High Cadence',
    description:
      'Turn dead detention time into a calorie-burning energy blast. No equipment needed—uses your lower cab step and tractor bumper to burn 100+ calories before your freight is loaded.',
    exercises: [
      {
        name: 'Cab Step Box Step-Ups',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Lower non-slip cab ingress step',
        cue: 'AJ Risner: "Step firmly onto the diamond-plate step. Keep a controlled, steady pace. Alternate lead legs every 5 reps."'
      },
      {
        name: 'Tractor Bumper Incline Pushups to Knee Tuck',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Front bumper or fuel tank strap',
        cue: 'AJ Risner: "Keep your back straight like a board. Chest touches bumper, press back, bring right knee up, then repeat left."'
      },
      {
        name: 'Trailer Tire Touch Bodyweight Squats',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Stand 12 inches in front of dual rear drive tires',
        cue: 'AJ Risner: "Squat down until your backside gently touches the rubber of the commercial tire, then stand straight back up."'
      },
      {
        name: 'Trailer Flank High-Knee Shuffle',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Clear pavement strip along trailer length (53 ft)',
        cue: 'AJ Risner: "Pump your arms and jog knees up alongside your 53-foot trailer. Always watch out for forklift traffic."'
      },
      {
        name: 'ICC Bumper Wall Sit',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Back against rear trailer door, thighs parallel to asphalt',
        cue: 'AJ Risner: "Sink down until knees are at 90 degrees. Breathe slowly through your nose. Your thigh muscles will feel the work."'
      },
      {
        name: 'Diamond-Plate Step Ankle Bounces',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Flat ground beside steer tire',
        cue: 'AJ Risner: "Gentle, springy hops on the balls of your feet. Wakes up stiff ankles and gets blood moving out of your lower legs."'
      },
      {
        name: 'Trailer Skirt Reverse Lunges',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Pavement beside trailer skirt',
        cue: 'AJ Risner: "Alternating reverse lunges. Keep your chest upright and move in a slow and controlled rhythm."'
      },
      {
        name: 'Tractor Mirror Shadow Boxing',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Standing in stall beside cab mirror',
        cue: 'AJ Risner: "Punch straight 1-2 punches into the air with your core tight. Wakes up your shoulders and gets your lungs working."'
      }
    ]
  },
  {
    id: 'drill-3',
    title: 'Sleeper Berth & Steering Wheel Decompressor',
    locationContext: '100% In-Cab / Sleeper Berth',
    durationMinutes: 5,
    focus: 'Bad weather / detention lockdown • Neck, mid-back & glute wake-up',
    intensity: 'Active Mobility & Decompression',
    description:
      'Designed for severe weather shutdowns, high-security chemical facilities where leaving the cab is forbidden, or midnight dock waits. Executed 100% inside the cab and bunk.',
    exercises: [
      {
        name: 'Steering Wheel Back Pull & Chest Opener',
        workSec: 40,
        restSec: 10,
        rigAnchor: 'Driver air-ride seat & steering wheel',
        cue: 'AJ Risner: "Grip wheel at 9 and 3 o\'clock. Push chest forward while pulling back on the wheel. Squeeze upper back for 5-second holds."'
      },
      {
        name: 'Driver Seat Glute & Sciatic Figure-4 Stretch',
        workSec: 40,
        restSec: 10,
        rigAnchor: 'Seated in driver seat',
        cue: 'AJ Risner: "Cross right ankle over left knee. Keep back straight and lean forward until you feel a deep glute stretch. Unpinches the sciatic nerve."'
      },
      {
        name: 'Sleeper Berth Glute Bridges with Top Pause',
        workSec: 40,
        restSec: 10,
        rigAnchor: 'Lying on sleeper bunk mattress',
        cue: 'AJ Risner: "Drive heels into mattress, lift hips up, and squeeze glutes hard for 2 seconds. Re-activates sleeping glutes after hours of sitting."'
      },
      {
        name: 'Bunk Bed Seated Torso Windmills',
        workSec: 40,
        restSec: 10,
        rigAnchor: 'Seated tall on bunk edge',
        cue: 'AJ Risner: "Rotate shoulders fully left, look behind you, hold 2 seconds, then rotate right. Wrings out stiffness along the mid-back."'
      },
      {
        name: 'Neck Retraction & Headrest Push',
        workSec: 40,
        restSec: 10,
        rigAnchor: 'Headrest of driver seat or sleeper wall',
        cue: 'AJ Risner: "Pull your chin straight back into your neck against the headrest. Reverses forward-head steering posture."'
      }
    ]
  },
  {
    id: 'drill-4',
    title: 'Freight Handler Grip & Back Armor',
    locationContext: 'Beside Trailer / Dock Bay',
    durationMinutes: 10,
    focus: 'Grip strength, back pulling power, and lower back stability',
    intensity: 'Power & Grip',
    description:
      'Commercial linehaul and flatbed freight requires strong hands and back armor to throw tarps, crank landing gears, and pull fifth-wheel pins. This 10-minute circuit builds rugged durability.',
    exercises: [
      {
        name: 'Trailer Rub-Rail Inverted Rows',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Under trailer side rub-rail or ICC bar',
        cue: 'AJ Risner: "Grip the trailer rail, step feet forward, pull your chest up toward the metal frame with your body straight."'
      },
      {
        name: 'Fifth-Wheel Pin Pull Steady Hold',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Pavement beside drive tires',
        cue: 'AJ Risner: "Simulate pulling a stuck fifth wheel pin: staggered stance, flat back, brace core, and hold a slow and controlled steady pull."'
      },
      {
        name: 'Landing Gear Crank Reverse Lunges',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Beside landing gear leg',
        cue: 'AJ Risner: "Deep reverse lunge with smooth rotational arm circles to condition your side abs for heavy gear cranking."'
      },
      {
        name: 'Grab Rail Dead-Hang Spine Stretch',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Cab side grab rail or headache rack',
        cue: 'AJ Risner: "Hang from the cab grab rail for 20-30 seconds with feet lightly touching or off ground. Relieves lower back compression instantly."'
      },
      {
        name: 'Cab Step Split Squats',
        workSec: 45,
        restSec: 15,
        rigAnchor: 'Cab lower step',
        cue: 'AJ Risner: "Back foot elevated on step, front foot out on asphalt. Lower down with slow and controlled motion, then stand tall."'
      }
    ]
  }
];
