import { TrainingDay } from '../types';

export const REST_STOP_PROTOCOLS: TrainingDay[] = [
  {
    id: 'day-1',
    dayNumber: 1,
    title: 'The Posture & Pull Fix',
    subtitle: 'Neck relief, back & glute posture reset',
    description:
      'Reverses the classic "linehaul slouch" caused by 11 hours gripping the steering wheel. Focuses on banded pulling, opening tight shoulders, and single-leg balance off the cab steps.',
    targetFocus: 'Upper Back, Shoulders, Tight Driving Hips, Glutes',
    durationMinutes: 18,
    equipmentRequired: ['Medium Resistance Band', 'Lower Cab Step', 'Rig Grab Rail'],
    recommendedTime: 'Post-shift mandatory 30-min break or evening shutdown',
    exercises: [
      {
        id: 'd1-ex1',
        name: 'Banded Horizontal Pull-Aparts',
        targetArea: 'Rear Shoulders & Upper Back',
        equipment: 'Resistance Band',
        rigAnchor: 'Hand-held at chest height (shoulder-width grip)',
        sets: 4,
        repsOrDuration: '15-20 reps',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Do not pull from your wrists. Squeeze your shoulder blades together like you are crushing a soda can between them. Keep ribs down."',
        posturalBenefit:
          'Pulls rounded shoulders back after hundreds of highway miles holding wheel tension.',
        stepGuide: [
          'Grip band at shoulder width with overhand grip and slight bend in elbows.',
          'Inhale into belly, then exhale as you pull fists outward across your chest.',
          'Touch band to chest, squeeze upper back for a full pause.',
          'Slow and controlled return without letting the band snap back.'
        ]
      },
      {
        id: 'd1-ex2',
        name: 'Cab-Step Split Squats',
        targetArea: 'Front Thighs, Glutes & Tight Driving Hips',
        equipment: 'Cab Step',
        rigAnchor: 'Rear foot laces resting on lower cab step or battery box step',
        sets: 3,
        repsOrDuration: '10 reps per leg',
        tempo: 'Slow and controlled',
        restSeconds: 60,
        coachingCue:
          'AJ Risner: "Resting your back foot on the rig step gives a deep, relieving stretch through your driving hip while rebuilding single-leg strength."',
        posturalBenefit:
          'Opens tight hip flexors that lock up from hours in the driver seat working pedals.',
        hazardNote: 'Ensure footwear is oil-free before placing foot on metal cab step.',
        stepGuide: [
          'Stand 2 to 3 feet in front of your truck cab step facing away.',
          'Reach back with one foot and rest toes firmly on the lower step tread.',
          'Lower your torso straight down until front thigh is parallel to asphalt.',
          'Drive through front heel to stand up tall.'
        ]
      },
      {
        id: 'd1-ex3',
        name: 'Rig Mirror Banded Face Pulls',
        targetArea: 'Rear Shoulders & Upper Back Posture',
        equipment: 'Resistance Band',
        rigAnchor: 'Looped around west-coast mirror bracket or cab grab rail (eye height)',
        sets: 3,
        repsOrDuration: '15 reps',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Pull your knuckles back toward your temples, elbows high and wide. Feel the muscles in the back of your shoulders fire."',
        posturalBenefit:
          'Fixes rounded shoulders and forward head tilt from staring through the windshield.',
        stepGuide: [
          'Loop resistance band through the rig grab handle or mirror bracket at eye level.',
          'Step back until moderate tension is felt, palms facing each other.',
          'Pull band straight toward eyes while flaring elbows high and back.',
          'Hold the squeeze for a full second before a slow and controlled release.'
        ]
      },
      {
        id: 'd1-ex4',
        name: 'Rig Grab-Rail Supported Rows',
        targetArea: 'Back, Lats & Spine Support',
        equipment: 'Rig / Grab Rail',
        rigAnchor: 'Two-hand grip on cab exterior grab rail',
        sets: 3,
        repsOrDuration: '12-15 reps',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Use your body angle for resistance. Walk feet closer under the cab to make it harder. Drive your elbows back past your ribs."',
        posturalBenefit:
          'Strengthens the big back muscles to cushion your spine against cab road vibration.',
        stepGuide: [
          'Grip vertical cab grab bar with both hands, feet braced firmly on asphalt.',
          'Lean back until arms are fully extended at a comfortable body angle.',
          'Drive elbows backward, pulling chest toward the grab bar.',
          'Keep your body rigid in a straight line from heels to neck.'
        ]
      }
    ]
  },
  {
    id: 'day-2',
    dayNumber: 2,
    title: 'High-Idle Cardio & Core',
    subtitle: 'Core stability & blood circulation',
    description:
      'Stimulates full-body blood circulation and strengthens the core to protect the lower back without jarring road shocks. Uses sleeper-berth control and commercial drive tires.',
    targetFocus: 'Abs, Obliques, Core & Heart Health',
    durationMinutes: 16,
    equipmentRequired: ['Commercial Tire (Drive or Steer)', 'Sleeper Berth Mattress / Cab Floor', 'Resistance Band'],
    recommendedTime: 'Morning pre-trip inspection or midway fuel stop',
    exercises: [
      {
        id: 'd2-ex1',
        name: 'Sleeper-Berth Dead Bugs',
        targetArea: 'Deep Abs, Core & Lower Back Support',
        equipment: 'Sleeper Berth',
        rigAnchor: 'Flat on sleeper berth mattress or cab bunk',
        sets: 4,
        repsOrDuration: '12 total reps',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Press your lower back into the mattress so flat that a playing card could not slide under it. Move with steady control."',
        posturalBenefit:
          'Teaches your hips and pelvis to stay balanced, reducing lower back spasms from highway bumps.',
        stepGuide: [
          'Lie flat on back in bunk with arms straight up to ceiling, knees bent 90 degrees.',
          'Exhale and flatten your lower back into the mattress.',
          'Slowly lower right arm behind head and extend left leg out straight without arching your back.',
          'Return to top and alternate smoothly with opposite arm and leg.'
        ]
      },
      {
        id: 'd2-ex2',
        name: 'Drive-Tire Lug Elevated Planks',
        targetArea: 'Core Wall, Shoulders & Back Support',
        equipment: 'Commercial Tire',
        rigAnchor: 'Forearms rested on top tread of tractor drive tire or steer tire',
        sets: 3,
        repsOrDuration: '45-60 seconds hold',
        tempo: 'Slow and controlled hold',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Drive your forearms into the rubber tire tread. Squeeze glutes tight and breathe smoothly into your belly."',
        posturalBenefit:
          'Builds a natural internal back brace that protects your spine when pulling heavy fuel hoses or fifth wheel pins.',
        stepGuide: [
          'Stand in front of tractor drive tire and place forearms onto tire tread.',
          'Step feet back on asphalt until body forms a straight, strong plank.',
          'Tuck tailbone slightly and brace your stomach muscles.',
          'Hold position while breathing steadily for the full duration.'
        ]
      },
      {
        id: 'd2-ex3',
        name: 'Cab-Step High-Idle Step Taps',
        targetArea: 'Calves, Foot Circulation & Heart Engine',
        equipment: 'Cab Step',
        rigAnchor: 'Lower metal cab step / fuel tank rung',
        sets: 4,
        repsOrDuration: '30 sec ON / 30 sec OFF',
        tempo: 'Slow and controlled',
        restSeconds: 30,
        coachingCue:
          'AJ Risner: "Stay light on the balls of your feet. This flushes pooled blood out of your lower legs and gets the heart pumping."',
        posturalBenefit:
          'Wakes up leg circulation and prevents swelling and heavy pedal cramps during long hauls.',
        stepGuide: [
          'Stand facing cab step with arms in a relaxed athletic posture.',
          'Tap right toe to step edge, then switch and tap left toe in a steady alternating rhythm.',
          'Keep knees soft and chest upright.',
          'Keep a smooth, steady pace for all 30 seconds.'
        ]
      },
      {
        id: 'd2-ex4',
        name: 'Mirror-Anchored Core Press & Hold',
        targetArea: 'Side Abs & Anti-Twist Lower Back Shield',
        equipment: 'Resistance Band',
        rigAnchor: 'Mirror bracket or grab rail at mid-chest height',
        sets: 3,
        repsOrDuration: '10 presses + 10 sec hold per side',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "The band is trying to twist you back toward the truck. Resist it completely. Keep your chest squared up."',
        posturalBenefit:
          'Fixes uneven back tension caused by resting your left arm on the window ledge for 600 miles.',
        stepGuide: [
          'Anchor band to mirror mount; step sideways until tension pulls sideways on your hands.',
          'Hold band with both hands against center of chest.',
          'Press hands straight out in front of chest without letting torso twist.',
          'Hold straight out for a beat, then return with slow and controlled motion.'
        ]
      }
    ]
  },
  {
    id: 'day-3',
    dayNumber: 3,
    title: 'Lower Body Strength & Hinge',
    subtitle: 'Glute wake-up, hamstrings & knee relief',
    description:
      'Long hours in the driver seat shut off glutes and shorten hamstrings. Day 3 rebuilds hip strength and lower body stability with bands and truck-anchored movements.',
    targetFocus: 'Hamstrings, Glutes, Thighs & Lower Back',
    durationMinutes: 18,
    equipmentRequired: ['Resistance Band', 'Rig Grab Rail / Bumper', 'Asphalt Ground'],
    recommendedTime: 'Post-drive rest window or mandatory pre-trip',
    exercises: [
      {
        id: 'd3-ex1',
        name: 'Banded Romanian Deadlifts (RDLs)',
        targetArea: 'Hamstrings (back of legs), Glutes & Lower Back',
        equipment: 'Resistance Band',
        rigAnchor: 'Stand with midfoot on band loop, grip both loop ends with hands',
        sets: 4,
        repsOrDuration: '12-15 reps',
        tempo: 'Slow and controlled',
        restSeconds: 60,
        coachingCue:
          'AJ Risner: "Push your hips straight back toward your drive tires while keeping shins upright. Feel the deep stretch through the back of your thighs."',
        posturalBenefit:
          'Restores hip hinge power so you lift heavy landing gear and freight with your hips instead of your lower back.',
        stepGuide: [
          'Place feet hip-width apart standing squarely on the middle of the band.',
          'Hinge forward from hips, grip band ends with hands at mid-shin.',
          'Pull shoulders back, flatten back, push the asphalt away through your heels.',
          'Squeeze glutes at the top without leaning back.'
        ]
      },
      {
        id: 'd3-ex2',
        name: 'Rig Grab-Rail Supported Deep Squats',
        targetArea: 'Hips, Thighs & Knees',
        equipment: 'Rig / Grab Rail',
        rigAnchor: 'Hands holding cab exterior rail for balance support',
        sets: 4,
        repsOrDuration: '12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Holding the grab rail lets you sink into a rock-bottom deep squat without falling backward. Open up those stiff hip joints."',
        posturalBenefit:
          'Lubricates dry knee and hip joints that stiffen up after hours of stationary sitting.',
        stepGuide: [
          'Stand arms-length from cab rail, feet shoulder-width, toes turned slightly out.',
          'Hold rail lightly for balance and sink down into a deep, comfortable squat.',
          'Pause for a beat at the bottom while keeping your chest tall.',
          'Drive through midfoot and heels to stand back up smoothly.'
        ]
      },
      {
        id: 'd3-ex3',
        name: 'Fuel Tank Step Calf Pumps & Toe Raises',
        targetArea: 'Calves, Shins & Ankle Mobility',
        equipment: 'Cab Step',
        rigAnchor: 'Balls of feet on lower fuel tank / cab step rung',
        sets: 3,
        repsOrDuration: '15 calf raises + 15 toe raises',
        tempo: 'Slow and controlled',
        restSeconds: 30,
        coachingCue:
          'AJ Risner: "Let your heels drop below step level for a full calf stretch, then press up onto your toes. Prevents heavy throttle pedal foot cramps."',
        posturalBenefit:
          'Prevents Achilles tendon stiffness and heel pain from continuous pedal pressure.',
        stepGuide: [
          'Stand on edge of cab step with heels hanging free over the edge.',
          'Lower heels down until a deep stretch runs through calves.',
          'Press up onto big toes, holding for a full second.',
          'Turn around on flat ground and pull toes up toward shins for shin pumps.'
        ]
      },
      {
        id: 'd3-ex4',
        name: 'Banded Good Mornings',
        targetArea: 'Hamstrings, Lower Back & Glutes',
        equipment: 'Resistance Band',
        rigAnchor: 'Band looped around upper back/neck, other loop under feet',
        sets: 3,
        repsOrDuration: '12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Slight bend in your knees. Push your hips straight back as if closing the heavy cab door with your backside."',
        posturalBenefit:
          'Strengthens the muscles holding your spine upright so your back doesn\'t fatigue on long rough roads.',
        stepGuide: [
          'Loop one end of band under feet, loop other end behind neck resting on upper back.',
          'Keep chest proud and eyes looking forward.',
          'Hinge backward at hips with a flat back until upper body is leaned forward.',
          'Drive hips forward to stand straight up.'
        ]
      }
    ]
  },
  {
    id: 'day-4',
    dayNumber: 4,
    title: 'Active Recovery & Mobility',
    subtitle: 'Mid-back relief, sciatic nerve stretch & unwind',
    description:
      'The antidote to grueling linehaul shifts. Clears muscle stiffness, unlocks the mid-back, releases the sciatic nerve, and helps you relax before bunk sleep.',
    targetFocus: 'Mid-Back, Glutes, Sciatic Relief & Relaxation',
    durationMinutes: 15,
    equipmentRequired: ['Trailer Wall / Rig Side', 'Cab Bunk / Step', 'Bodyweight'],
    recommendedTime: 'Pre-bedtime wind down in sleeper berth or lot rest area',
    exercises: [
      {
        id: 'd4-ex1',
        name: 'Trailer Wall Arm Sweeps',
        targetArea: 'Mid-Back & Chest Openers',
        equipment: 'Rig / Grab Rail',
        rigAnchor: 'Standing sideways against smooth trailer panel',
        sets: 3,
        repsOrDuration: '8 sweeps per side',
        tempo: 'Slow and controlled',
        restSeconds: 30,
        coachingCue:
          'AJ Risner: "Trace a huge rainbow across your trailer panel with your fingertips. Follow your hand with your eyes. Breathe into your ribs."',
        posturalBenefit:
          'Restores twisting mobility in the mid-back that gets locked up from static cab posture.',
        stepGuide: [
          'Stand parallel to trailer wall, shoulder and hip a few inches away.',
          'Reach both arms straight forward.',
          'Sweep the inside arm up and back in a wide circular arc across trailer skin.',
          'Rotate chest open toward the sky, then return smoothly.'
        ]
      },
      {
        id: 'd4-ex2',
        name: 'Cab-Step Seated Glute & Sciatic Stretch',
        targetArea: 'Outer Glutes & Sciatic Nerve Relief',
        equipment: 'Cab Step',
        rigAnchor: 'Seated on cab lower step or driver seat edge',
        sets: 3,
        repsOrDuration: '45 seconds hold per leg',
        tempo: 'Slow and controlled hold',
        restSeconds: 30,
        coachingCue:
          'AJ Risner: "Cross your ankle over your opposite knee into a figure-4. Keep your spine tall and hinge your chest forward until you feel the knot release."',
        posturalBenefit:
          'Releases the deep glute muscles that pinch the sciatic nerve during long interstate sitting.',
        stepGuide: [
          'Sit tall on edge of truck cab step with both feet flat on ground.',
          'Cross right ankle over left thigh just above knee.',
          'Gently place hand on right knee to guide it downward.',
          'Hinge chest forward from hips while keeping back straight until stretch is felt in outer hip.'
        ]
      },
      {
        id: 'd4-ex3',
        name: 'Bumper Supported Cat-Cow & Spine Stretch',
        targetArea: 'Entire Spine & Lower Back Relief',
        equipment: 'Rig / Grab Rail',
        rigAnchor: 'Hands resting on front truck bumper or trailer ICC bar',
        sets: 3,
        repsOrDuration: '10 smooth breath cycles',
        tempo: 'Slow and controlled',
        restSeconds: 30,
        coachingCue:
          'AJ Risner: "Move every single joint in your spine. Arch up like an angry cat to decompress your back, then drop belly and lift chest to stretch."',
        posturalBenefit:
          'Pumps refreshing circulation back into spinal discs compressed by diesel road vibrations.',
        stepGuide: [
          'Place hands on bumper or frame rail, feet hip-width, knees soft.',
          'Inhale: drop belly, lift chest and look up smoothly.',
          'Exhale: tuck tailbone under, round back up toward sky, tuck chin to chest.',
          'Finish with a relaxed 15-second hang pushing hips back.'
        ]
      },
      {
        id: 'd4-ex4',
        name: 'Diaphragmatic "Cab Flush" Box Breathing',
        targetArea: 'Stress Relief, Heart Rate Downshift & Sleep Readiness',
        equipment: 'Sleeper Berth',
        rigAnchor: 'Seated in sleeper berth or driver seat with back supported',
        sets: 4,
        repsOrDuration: '4 cycles (4s in - 4s hold - 4s out - 4s hold)',
        tempo: 'Slow and controlled',
        restSeconds: 20,
        coachingCue:
          'AJ Risner: "Heavy traffic and long driving hours spike your stress. This 4-count box breathing instantly calms your nervous system for deep restorative sleep."',
        posturalBenefit:
          'Calms the nervous system and lowers stress hormones, preparing you for quality sleep inside the bunk.',
        stepGuide: [
          'Close eyes and place one hand on chest, one hand on belly.',
          'Inhale through nose for 4 seconds, feeling only belly rise.',
          'Hold breath calmly for 4 seconds.',
          'Exhale smoothly through parted lips for 4 seconds.',
          'Hold lungs empty for 4 seconds before next breath.'
        ]
      }
    ]
  }
];

export const LIGHT_DB_PROTOCOLS: TrainingDay[] = [
  {
    id: 'db-1',
    dayNumber: 1,
    title: 'Full Body Armor & Postural Reset',
    subtitle: 'Sleeper berth or lot asphalt • Simple dumbbell routine',
    description:
      'Engineered for drivers carrying a single light pair of dumbbells (10-25 lbs). Counteracts the spinal compression and rounded shoulders of long shifts through simple, controlled compound lifts.',
    targetFocus: 'Thighs, Glutes, Back, Shoulders & Core',
    durationMinutes: 20,
    equipmentRequired: ['Light Dumbbells (10-25 lbs)', 'Flat Ground or Cab Step'],
    recommendedTime: 'Post-shift shutdown or afternoon rest break',
    exercises: [
      {
        id: 'db1-ex1',
        name: 'Light DB Goblet Squats with Bottom Pause',
        targetArea: 'Thighs, Glutes & Hip Alignment',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Flat ground beside the rig or on sleeper bunk floor',
        sets: 3,
        repsOrDuration: '12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 50,
        coachingCue:
          'AJ Risner: "Hold the dumbbell vertical against your chest. Sink down until thighs are parallel to ground. A brief pause at the bottom wakes up hip stabilizers without needing heavy weight."',
        posturalBenefit:
          'Opens tight hips and relieves lower back pressure caused by road vibration.',
        hazardNote: 'Keep feet flat on pavement; do not let heels lift.',
        stepGuide: [
          'Hold one dumbbell vertically with both hands under your chin.',
          'Feet shoulder-width apart, toes turned out slightly.',
          'Lower down with slow and controlled motion into a squat.',
          'Pause for a second at the bottom with chest tall.',
          'Drive through heels to stand back up, squeezing glutes at the top.'
        ]
      },
      {
        id: 'db1-ex2',
        name: 'Single-Arm DB Step/Bumper Rows',
        targetArea: 'Back, Upper Back & Shoulders',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Non-working hand braced on cab lower step, fuel tank strap, or bumper',
        sets: 3,
        repsOrDuration: '12 reps per arm',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Pull your elbow toward your back hip pocket like starting a lawnmower. Squeeze your shoulder blade flat against your back."',
        posturalBenefit:
          'Directly pulls rounded shoulders back after hours gripping the steering wheel.',
        stepGuide: [
          'Place one hand firmly on the truck cab step or bumper for flat-back support.',
          'Hold dumbbell in opposite hand hanging straight down under shoulder.',
          'Pull elbow back toward hip, keeping arm close to ribs.',
          'Pause and squeeze upper back for a second, then lower with slow and controlled pace.'
        ]
      },
      {
        id: 'db1-ex3',
        name: 'Light DB Romanian Deadlift to Shrug',
        targetArea: 'Hamstrings, Glutes & Upper Back',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Asphalt beside drive tires',
        sets: 3,
        repsOrDuration: '12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Hinge backward from your hips like trying to tap your trailer mudflap with your backside. Stand up and finish with a smooth shoulder shrug."',
        posturalBenefit:
          'Strengthens the back of your thighs and neck to relieve steering stiffness.',
        stepGuide: [
          'Stand tall holding a dumbbell in each hand in front of thighs.',
          'Slight bend in knees, push hips back, sliding dumbbells down shins until you feel a hamstring stretch.',
          'Keep your back flat and straight.',
          'Drive hips forward to stand, then shrug shoulders up toward ears for a clean squeeze.'
        ]
      },
      {
        id: 'db1-ex4',
        name: 'Standing DB Shoulder Press with Twist',
        targetArea: 'Shoulders, Upper Back & Posture',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Beside driver door or sleeper berth',
        sets: 3,
        repsOrDuration: '10 reps',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Start with palms facing you, then smoothly rotate out and press overhead. This keeps your shoulder joints healthy and moving freely."',
        posturalBenefit:
          'Strengthens shoulders and eases steering stiffness without chewing up your joints.',
        stepGuide: [
          'Hold dumbbells at chin height with palms facing your chest.',
          'As you press upward, rotate palms forward so they face front at the top.',
          'Pause briefly overhead without arching lower back.',
          'Lower down with slow and controlled motion back to chin level.'
        ]
      },
      {
        id: 'db1-ex5',
        name: 'Single-Arm DB Suitcase Carry March',
        targetArea: 'Side Abs, Core Stability & Grip',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Perimeter walkway along trailer or parking stall',
        sets: 3,
        repsOrDuration: '45 seconds per side',
        tempo: 'Slow and controlled',
        restSeconds: 30,
        coachingCue:
          'AJ Risner: "Hold the dumbbell in one hand only. Stand tall and don\'t lean sideways—walk like you have a steel rod through your spine."',
        posturalBenefit:
          'Builds core stiffness that protects your spine when lifting heavy hoods or dolly cranks.',
        stepGuide: [
          'Hold one dumbbell in right hand by your side like carrying a heavy toolbox.',
          'Brace core, square shoulders, and walk in a steady march.',
          'Keep your torso completely vertical with zero leaning.',
          'Switch hands after 45 seconds and repeat on opposite side.'
        ]
      }
    ]
  },
  {
    id: 'db-2',
    dayNumber: 2,
    title: 'The 15-Minute Asphalt Flush',
    subtitle: 'Circulation & energy boost during 30-min break',
    description:
      'A time-efficient circuit that gets your heart beating, pumps blood out of stagnant legs, and recharges alertness during mandatory 30-minute DOT breaks.',
    targetFocus: 'Legs, Shoulders, Upper Back & Heart Engine',
    durationMinutes: 15,
    equipmentRequired: ['Light Dumbbells (10-25 lbs)'],
    recommendedTime: 'Mandatory 30-minute DOT rest break',
    exercises: [
      {
        id: 'db2-ex1',
        name: 'Light DB Reverse Lunges',
        targetArea: 'Thighs, Glutes & Tight Driving Hips',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Clear lot asphalt beside tractor fuel tanks',
        sets: 3,
        repsOrDuration: '10 reps per leg',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Step back smoothly and lower your back knee until it hovers just above the pavement. Feel the front hip open up."',
        posturalBenefit:
          'Stretches tight driving hips that remain bent for hours in the driver seat.',
        stepGuide: [
          'Hold dumbbells by sides with neutral grip.',
          'Take a controlled step backward with one leg.',
          'Lower down until front thigh is parallel to ground.',
          'Drive through front heel to return to standing.'
        ]
      },
      {
        id: 'db2-ex2',
        name: 'Light DB Clean & Push Press',
        targetArea: 'Full Body, Shoulders & Heart Rate',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Asphalt beside front steer tires',
        sets: 4,
        repsOrDuration: '10 reps',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Bring the dumbbells smoothly to your shoulders, then use a slight knee dip to press them overhead. Smooth and steady."',
        posturalBenefit:
          'Gets fresh oxygen and blood pumping through the brain to fight highway drowsiness.',
        stepGuide: [
          'Hold dumbbells hanging by knees with flat back.',
          'Stand up tall, bringing weights to your shoulders.',
          'Dip knees slightly and press weights overhead.',
          'Lower back to shoulders and down with slow and controlled motion.'
        ]
      },
      {
        id: 'db2-ex3',
        name: 'Bent-Over DB Rear Delt Flyes',
        targetArea: 'Rear Shoulders & Upper Back',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Beside truck cab',
        sets: 3,
        repsOrDuration: '15 reps',
        tempo: 'Slow and controlled',
        restSeconds: 30,
        coachingCue:
          'AJ Risner: "Keep your back flat. Raise dumbbells wide like wings and squeeze your upper back. This directly pulls rounded shoulders back."',
        posturalBenefit:
          'Reverses forward slouching and opens chest for easier breathing.',
        stepGuide: [
          'Hinge at hips with flat back, torso leaned forward.',
          'Dumbbells hang below chest with slight bend in elbows.',
          'Raise weights out to sides in a wide arc until level with back.',
          'Pinch shoulder blades together for a second, then lower with control.'
        ]
      },
      {
        id: 'db2-ex4',
        name: 'Light DB High Pulls from Knee',
        targetArea: 'Upper Back, Traps & Grip',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Asphalt beside cab step',
        sets: 3,
        repsOrDuration: '12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 30,
        coachingCue:
          'AJ Risner: "Lead with your elbows. Keep elbows higher than wrists as the dumbbells rise toward your chest."',
        posturalBenefit:
          'Improves upper-back strength and builds grip endurance for handling heavy cargo straps.',
        stepGuide: [
          'Hold dumbbells in front of thighs with overhand grip.',
          'Dip hips slightly, then pull elbows up and wide toward chest height.',
          'Keep weights close to body throughout.',
          'Lower smoothly back to thighs.'
        ]
      }
    ]
  },
  {
    id: 'db-3',
    dayNumber: 3,
    title: 'Sleeper Berth Core & Bunk Routine',
    subtitle: 'Zero outdoor space required • 100% in-cab or sleeper bunk',
    description:
      'Created specifically for severe winter weather, rain, or crowded truck stops. Done entirely on your sleeper berth mattress or cab floor with light dumbbells.',
    targetFocus: 'Chest, Arms, Abs & Core Stability',
    durationMinutes: 16,
    equipmentRequired: ['Light Dumbbells (10-25 lbs)', 'Sleeper Berth Mattress / Cab Floor'],
    recommendedTime: 'Bad weather shutdown or late night bunk routine',
    exercises: [
      {
        id: 'db3-ex1',
        name: 'Sleeper Bunk DB Floor Press',
        targetArea: 'Chest, Front Shoulders & Triceps',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Lying flat on sleeper berth mattress or cab floor mat',
        sets: 3,
        repsOrDuration: '12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "The bunk mattress protects your shoulders from hyperextending. Press up smoothly, lock your elbows, and keep your abs braced."',
        posturalBenefit:
          'Safe chest pressing that builds pushing strength without straining delicate shoulder joints.',
        stepGuide: [
          'Lie flat on back on the sleeper mattress with knees bent and feet flat.',
          'Hold dumbbells above chest.',
          'Lower arms until elbows gently touch the mattress.',
          'Pause for a beat, then press weights back up over chest.'
        ]
      },
      {
        id: 'db3-ex2',
        name: 'Light DB Pullover & Chest Stretch',
        targetArea: 'Ribcage, Lats & Upper Back',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Sleeper berth mattress',
        sets: 3,
        repsOrDuration: '12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 40,
        coachingCue:
          'AJ Risner: "As the dumbbell lowers behind your head, take a deep belly breath. Feel your entire ribcage stretch and expand."',
        posturalBenefit:
          'Releases tight back muscles and opens up shallow chest breathing caused by sitting.',
        stepGuide: [
          'Lie on bunk holding one dumbbell vertically with both hands over chest.',
          'Keep slight bend in elbows and slowly lower dumbbell back over head.',
          'Inhale deeply into belly at the stretch position.',
          'Pull dumbbell smoothly back over chest while exhaling.'
        ]
      },
      {
        id: 'db3-ex3',
        name: 'Bunk Edge Seated DB Shoulder Press',
        targetArea: 'Shoulders & Core Posture',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Seated tall on sleeper berth edge or floor with legs straight',
        sets: 3,
        repsOrDuration: '10 reps',
        tempo: 'Slow and controlled',
        restSeconds: 45,
        coachingCue:
          'AJ Risner: "Sitting flat with legs extended stops you from leaning back or cheating. All the work comes from your shoulders and core."',
        posturalBenefit:
          'Teaches your spine to stay upright and strengthens shoulders for steering control.',
        stepGuide: [
          'Sit on sleeper berth floor with legs extended out front.',
          'Hold dumbbells at shoulder level, sitting tall with chest out.',
          'Press dumbbells straight overhead without leaning back.',
          'Lower to shoulders with slow and controlled motion.'
        ]
      },
      {
        id: 'db3-ex4',
        name: 'Seated DB Torso Rotations',
        targetArea: 'Side Abs & Core Shield',
        equipment: 'Light Dumbbells',
        rigAnchor: 'Sleeper bunk mattress',
        sets: 3,
        repsOrDuration: '14 total rotations',
        tempo: 'Slow and controlled',
        restSeconds: 30,
        coachingCue:
          'AJ Risner: "Turn your shoulders with the dumbbell, not just your hands. Keeps your back strong for climbing 3-point in and out of the rig."',
        posturalBenefit:
          'Protects your lower back from twisting strains when handling cargo doors or landing gear.',
        stepGuide: [
          'Sit on sleeper mattress with knees bent, feet flat.',
          'Hold one light dumbbell with both hands at chest level, leaning torso back slightly.',
          'Rotate torso smoothly to right side, then rotate across to left side.',
          'Keep movement slow and controlled without swinging.'
        ]
      }
    ]
  }
];

export const ROAD_WARRIOR_PROTOCOLS: TrainingDay[] = [
  {
    id: 'rw-1',
    dayNumber: 1,
    title: 'Posterior Chain & Posture Focus',
    subtitle: 'Commercial Gym / Planet Fitness • Back, Glutes & Posture',
    description:
      'Objective: Reverse the "slouched" driving posture by strengthening the back and glutes. Counteracts tight hip flexors and rounded steering-wheel shoulders.',
    targetFocus: 'Back, Glutes, Hamstrings, Chest & Core',
    durationMinutes: 40,
    equipmentRequired: ['Dumbbell or Kettlebell', 'Seated Cable Row', 'Smith Machine', 'Incline Bench', 'Mat'],
    recommendedTime: 'Day 1 of 3-Day Split (e.g. Monday layover or 10-hr reset)',
    exercises: [
      {
        id: 'rw1-ex1',
        name: 'Goblet Squats (with Dumbbell or Kettlebell)',
        targetArea: 'Glutes, Quads & Upright Posture',
        equipment: 'Dumbbells',
        rigAnchor: 'Commercial Gym Floor / DB Area',
        sets: 3,
        repsOrDuration: '10-12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 75,
        coachingCue:
          'AJ Risner: "Cup the dumbbell vertically under your chin. Push knees out over toes, keep chest tall, and drive through heels to stand. Why: Wakes up glutes and quads while keeping the torso upright."',
        posturalBenefit:
          'Wakes up glutes and quads while keeping the torso upright.',
        stepGuide: [
          'Hold a dumbbell or kettlebell vertically against your chest with both hands.',
          'Stand with feet shoulder-width apart, toes turned slightly outward.',
          'Hinge hips back and bend knees, sinking down until thighs are parallel to floor.',
          'Pause for a second with an upright chest, then drive through heels to stand.'
        ]
      },
      {
        id: 'rw1-ex2',
        name: 'Seated Cable Rows',
        targetArea: 'Mid-Back, Upper Back & Rear Shoulders',
        equipment: 'Cable Machine',
        rigAnchor: 'Seated Cable Row Station (V-Bar or Neutral Grip Handle)',
        sets: 3,
        repsOrDuration: '12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 75,
        coachingCue:
          'AJ Risner: "Focus on squeezing shoulder blades together. Do not pull with just your arms—initiate with your back. Why: Pulls shoulders back and strengthens the mid-back."',
        posturalBenefit:
          'Pulls shoulders back and strengthens the mid-back. Focus on squeezing shoulder blades together.',
        stepGuide: [
          'Sit at the low cable row station with knees slightly bent and feet placed on the footplates.',
          'Grasp the handle with arms extended, sit tall with a flat back and proud chest.',
          'Pull handle into your midsection by driving elbows back, squeezing shoulder blades together.',
          'Hold the squeeze for a second, then return with slow and controlled motion.'
        ]
      },
      {
        id: 'rw1-ex3',
        name: 'Smith Machine Romanian Deadlifts (RDLs)',
        targetArea: 'Hamstrings (back of legs) & Glutes',
        equipment: 'Smith Machine',
        rigAnchor: 'Smith Machine Barbell (Set at mid-thigh height)',
        sets: 3,
        repsOrDuration: '10-12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 90,
        coachingCue:
          'AJ Risner: "Keep a slight bend in your knees. Push your hips back as if tapping a wall behind you. Do not round your lower back. Why: Stretches and strengthens the hamstrings and glutes, which get compressed while sitting."',
        posturalBenefit:
          'Stretches and strengthens the hamstrings and glutes, which get compressed while sitting.',
        stepGuide: [
          'Stand inside Smith Machine with bar unlocked at thigh level, feet hip-width apart.',
          'Brace core and push hips backward while sliding bar down along your shins.',
          'Lower bar until you feel a deep hamstring stretch with a flat spine.',
          'Drive hips forward and squeeze glutes hard to stand up tall.'
        ]
      },
      {
        id: 'rw1-ex4',
        name: 'Dumbbell Incline Bench Press',
        targetArea: 'Chest, Shoulders & Arms',
        equipment: 'Dumbbells',
        rigAnchor: 'Adjustable Bench (Set to 30-degree incline)',
        sets: 3,
        repsOrDuration: '10 reps',
        tempo: 'Slow and controlled',
        restSeconds: 75,
        coachingCue:
          'AJ Risner: "Set bench to a moderate 30-degree incline. Keep elbows at a 45-degree angle to your body. Why: Works the chest and shoulders without putting too much strain on the rotator cuffs."',
        posturalBenefit:
          'Works the chest and shoulders without putting too much strain on the rotator cuffs.',
        stepGuide: [
          'Set adjustable bench to a 30-degree incline. Sit back holding dumbbells on your thighs.',
          'Bring dumbbells to shoulder level and lie back, planting feet firmly on the floor.',
          'Lower weights with slow and controlled motion until dumbbells reach chest level.',
          'Press back up smoothly to full extension without banging weights together.'
        ]
      },
      {
        id: 'rw1-ex5',
        name: 'Planks',
        targetArea: 'Core & Lower Back Shield',
        equipment: 'Bodyweight',
        rigAnchor: 'Gym Mat / Floor',
        sets: 3,
        repsOrDuration: '30-45 seconds',
        tempo: 'Slow and controlled hold',
        restSeconds: 50,
        coachingCue:
          'AJ Risner: "Tighten your glutes and pull your stomach muscles tight. Breathe steadily. Why: A strong core acts as a natural back brace for long drives."',
        posturalBenefit:
          'A strong core acts as a natural back brace for long drives.',
        stepGuide: [
          'Lie on a gym mat with forearms flat on floor, elbows under shoulders.',
          'Raise body onto forearms and toes, forming a straight line from heels to head.',
          'Squeeze glutes and brace your stomach muscles firmly.',
          'Hold the position without letting your hips sag or hike up.'
        ]
      }
    ]
  },
  {
    id: 'rw-2',
    dayNumber: 2,
    title: 'Mobility, Unilateral Balance & Core',
    subtitle: 'Commercial Gym / Planet Fitness • Single-Leg Balance & Anti-Twist Core',
    description:
      'Objective: Balance the body\'s uneven usage from driving (e.g., working pedals). Unlocks tight hip flexors and strengthens the upper back and shoulders.',
    targetFocus: 'Legs, Hip Flexors, Lats, Shoulders, Hamstrings & Core',
    durationMinutes: 42,
    equipmentRequired: ['Dumbbells', 'Lat Pulldown Machine or Cable', 'Leg Curl Machine', 'Cable Machine'],
    recommendedTime: 'Day 2 of 3-Day Split (e.g. Wednesday rest stop or gym stopover)',
    exercises: [
      {
        id: 'rw2-ex1',
        name: 'Dumbbell Walking Lunges or Stationary Split Squats',
        targetArea: 'Tight Hip Flexors, Quads & Single-Leg Balance',
        equipment: 'Dumbbells',
        rigAnchor: 'Gym Floor / Dumbbell Lane',
        sets: 3,
        repsOrDuration: '10 reps per leg',
        tempo: 'Slow and controlled',
        restSeconds: 75,
        coachingCue:
          'AJ Risner: "Take long, smooth strides. Lower your back knee until it hovers an inch above the floor. Why: Stretches tight hip flexors while building single-leg stability."',
        posturalBenefit:
          'Stretches tight hip flexors while building single-leg stability.',
        stepGuide: [
          'Hold a pair of dumbbells at your sides with arms straight and shoulders back.',
          'Step forward with your lead leg and lower straight down until back knee is just above floor.',
          'Drive through front heel to step into the next stride or return to start.',
          'Perform 10 reps on each leg with an upright chest.'
        ]
      },
      {
        id: 'rw2-ex2',
        name: 'Lat Pulldowns (Machine or Cable)',
        targetArea: 'Upper Back, Lats & Spinal Decompression',
        equipment: 'Cable Machine',
        rigAnchor: 'Lat Pulldown Machine (Wide Overhand Grip Bar)',
        sets: 3,
        repsOrDuration: '12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 75,
        coachingCue:
          'AJ Risner: "Grip wide. Pull your shoulders down away from your ears, bring bar to upper chest, and let the weights give you a gentle spine stretch at the top. Why: Decompresses the spine and builds upper back width."',
        posturalBenefit:
          'Decompresses the spine and builds upper back width.',
        stepGuide: [
          'Sit at lat pulldown station with thighs secured under roller pads.',
          'Grip wide bar with an overhand grip wider than shoulder width.',
          'Pull bar smoothly down to your collarbones while leaning back slightly.',
          'Squeeze back for a second, then slowly control bar back up for a full stretch overhead.'
        ]
      },
      {
        id: 'rw2-ex3',
        name: 'Dumbbell Shoulder Press (Seated)',
        targetArea: 'Shoulders & Steering Posture',
        equipment: 'Dumbbells',
        rigAnchor: 'Upright Seated Bench (90-degree back support)',
        sets: 3,
        repsOrDuration: '10 reps',
        tempo: 'Slow and controlled',
        restSeconds: 75,
        coachingCue:
          'AJ Risner: "Sit tall with your lower back supported by the seat pad. Press dumbbells up without clanging them at the top. Why: Strengthens the shoulders for better steering control and posture."',
        posturalBenefit:
          'Strengthens the shoulders for better steering control and posture.',
        stepGuide: [
          'Sit on an upright bench holding dumbbells at shoulder level with palms facing forward.',
          'Brace core and plant feet flat on the floor.',
          'Press dumbbells straight overhead until arms are extended.',
          'Lower weights with slow and controlled motion back to ear level.'
        ]
      },
      {
        id: 'rw2-ex4',
        name: 'Leg Curl Machine',
        targetArea: 'Hamstrings (back of thighs)',
        equipment: 'Commercial Gym',
        rigAnchor: 'Seated or Lying Hamstring Leg Curl Machine',
        sets: 3,
        repsOrDuration: '12-15 reps',
        tempo: 'Slow and controlled',
        restSeconds: 60,
        coachingCue:
          'AJ Risner: "Curl the pad all the way toward your glutes, squeeze for a second, and resist on the way back down. Why: Isolates the hamstrings."',
        posturalBenefit:
          'Isolates the hamstrings.',
        stepGuide: [
          'Adjust machine pad so it rests comfortably against the back of your lower calves.',
          'Grip machine handles and keep your hips down in the seat.',
          'Curl weight toward your glutes through full range of motion.',
          'Pause at peak squeeze, then slowly extend legs back with slow and controlled control.'
        ]
      },
      {
        id: 'rw2-ex5',
        name: 'Pallof Press (using Cable Machine)',
        targetArea: 'Anti-Rotation Core & Lower Back Protection',
        equipment: 'Cable Machine',
        rigAnchor: 'Adjustable Cable Column (Chest height with single handle or D-ring)',
        sets: 3,
        repsOrDuration: '10 reps per side',
        tempo: 'Slow and controlled',
        restSeconds: 50,
        coachingCue:
          'AJ Risner: "Stand sideways to the cable. Press the handle straight out from your chest and hold it still. Fight the cable\'s pull. Why: An anti-rotation core exercise. It teaches the core to resist twisting, directly protecting the lower back."',
        posturalBenefit:
          'An anti-rotation core exercise. It teaches the core to resist twisting, directly protecting the lower back.',
        stepGuide: [
          'Set cable pulley to mid-chest height. Stand sideways to machine holding handle against chest with both hands.',
          'Take a couple steps away to create cable tension. Soften knees and brace stomach.',
          'Press handle straight out in front of chest; hold still against the twisting pull.',
          'Slowly bring hands back to chest. Complete 10 reps, then turn around and do the other side.'
        ]
      }
    ]
  },
  {
    id: 'rw-3',
    dayNumber: 3,
    title: 'Strength & Lower Back Protection',
    subtitle: 'Commercial Gym / Planet Fitness • Compound Strength & Spine Armor',
    description:
      'Objective: Build overall functional strength with a mix of compound movements. Replaces heavy barbell squats with Planet Fitness friendly machines and hangs for spinal decompression.',
    targetFocus: 'Thighs, Chest, Back, Lower Back Muscles & Abs',
    durationMinutes: 44,
    equipmentRequired: ['Smith Machine or Leg Press', 'Dumbbells & Flat Bench', 'Hyperextension Bench', 'Pull-Up Bar or Captain\'s Chair'],
    recommendedTime: 'Day 3 of 3-Day Split (e.g. Friday post-haul or weekend layover)',
    exercises: [
      {
        id: 'rw3-ex1',
        name: 'Smith Machine Squats or Leg Press',
        targetArea: 'Thighs & Glutes',
        equipment: 'Smith Machine',
        rigAnchor: 'Smith Machine or 45-Degree Leg Press Sled',
        sets: 3,
        repsOrDuration: '10 reps',
        tempo: 'Slow and controlled',
        restSeconds: 105,
        coachingCue:
          'AJ Risner: "On the Smith machine, place your feet 3 to 4 inches forward of the bar. This takes strain off knees and puts the work directly into your hips. Why: Replaces traditional barbell heavy leg work (ideal for Planet Fitness limitations)."',
        posturalBenefit:
          'Replaces traditional barbell heavy leg work (ideal for Planet Fitness limitations).',
        stepGuide: [
          'Position Smith machine bar across upper back, feet shoulder-width and slightly forward.',
          'Rotate bar to unrack, inhale into belly, and descend smoothly until thighs reach parallel.',
          'Pause for a beat at the bottom with upright chest.',
          'Drive through mid-foot and heels to stand back up.'
        ]
      },
      {
        id: 'rw3-ex2',
        name: 'Dumbbell Flat Bench Press',
        targetArea: 'Chest & Triceps',
        equipment: 'Dumbbells',
        rigAnchor: 'Flat Workout Bench',
        sets: 3,
        repsOrDuration: '10 reps',
        tempo: 'Slow and controlled',
        restSeconds: 75,
        coachingCue:
          'AJ Risner: "Plant both feet flat on the floor. Lower the weights with control and press up smooth. Why: Standard chest and tricep strength."',
        posturalBenefit:
          'Standard chest and tricep strength.',
        stepGuide: [
          'Sit on flat bench with dumbbells resting on thighs. Lie back, bringing weights to chest level.',
          'Feet flat on the floor, shoulder blades pulled back into bench.',
          'Lower weights smoothly with elbows at a 45-degree angle until level with chest.',
          'Press weights back up over chest to full extension.'
        ]
      },
      {
        id: 'rw3-ex3',
        name: 'Single-Arm Dumbbell Rows',
        targetArea: 'Back & Core Stability',
        equipment: 'Dumbbells',
        rigAnchor: 'Flat Bench (One hand and knee supported)',
        sets: 3,
        repsOrDuration: '10 reps per arm',
        tempo: 'Slow and controlled',
        restSeconds: 60,
        coachingCue:
          'AJ Risner: "Support your torso with one hand and knee on the bench. Pull the dumbbell back toward your hip pocket. Why: Isolates each side of the back and forces the core to stabilize the torso."',
        posturalBenefit:
          'Isolates each side of the back and forces the core to stabilize the torso.',
        stepGuide: [
          'Place left knee and left hand on bench, torso flat like a table, right foot on floor.',
          'Hold dumbbell in right hand with arm hanging straight down.',
          'Pull dumbbell up toward your hip, keeping elbow close to side.',
          'Squeeze your back at the top for a second, then lower with slow and controlled motion.'
        ]
      },
      {
        id: 'rw3-ex4',
        name: 'Back Extensions (Hyperextension Bench)',
        targetArea: 'Lower Back Muscles & Glutes',
        equipment: 'Commercial Gym',
        rigAnchor: '45-Degree or Horizontal Hyperextension Bench',
        sets: 3,
        repsOrDuration: '12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 60,
        coachingCue:
          'AJ Risner: "Adjust pad so your hips can hinge. Lower down, then raise your upper body until your body forms a straight line. Do not hyperextend or fling your neck back. Why: Directly targets and strengthens the lower back muscles (erector spinae) to prevent driving fatigue."',
        posturalBenefit:
          'Directly targets and strengthens the lower back muscles (erector spinae) to prevent driving fatigue.',
        stepGuide: [
          'Step into hyperextension bench with heels locked under rear pads and hips against front pads.',
          'Cross arms over chest and hinge forward at the hips toward the floor.',
          'Engage lower back and glutes to lift torso until your body forms a straight line.',
          'Hold for a second, then lower down with slow and controlled motion.'
        ]
      },
      {
        id: 'rw3-ex5',
        name: 'Hanging Leg Raises (or Knee Tucks on the Captain\'s Chair)',
        targetArea: 'Lower Abs & Spinal Decompression Stretch',
        equipment: 'Commercial Gym',
        rigAnchor: 'Pull-Up Bar or Captain\'s Chair Dip Tower',
        sets: 3,
        repsOrDuration: '12 reps',
        tempo: 'Slow and controlled',
        restSeconds: 50,
        coachingCue:
          'AJ Risner: "Let your dead hang stretch your spine. Curl your knees up toward your chest by tucking your pelvis upward instead of swinging your legs. Why: Targets the lower abs and provides spinal decompression (stretch) while hanging."',
        posturalBenefit:
          'Targets the lower abs and provides spinal decompression (stretch) while hanging.',
        stepGuide: [
          'Hang from a pull-up bar with overhand grip or rest forearms on Captain\'s chair pads.',
          'Let legs hang straight down, feeling your spine stretch and lengthen.',
          'Curl knees up toward chest by curling your hips upward.',
          'Lower legs back down with slow and controlled motion without swinging.'
        ]
      }
    ]
  }
];

export const ROAD_WARRIOR_TIPS = {
  title: 'Linehaul Strong: Road Warrior Driver Quick Tips',
  frequencyNote: 'Train 3 days a week with at least one rest day between sessions (e.g., Monday, Wednesday, Friday).',
  restPeriodsNote: 'Resting between sets is crucial for recovery. Stick to the suggested rest times to keep the workout efficient and effective.',
  warmupProtocol: {
    title: 'Mandatory Pre-Workout Warm-Up (5-10 Minutes)',
    description: 'Driving keeps joints stiff. Spend 5-10 minutes warming up to prevent injury.',
    cardioNote: 'Cardio: 5 minutes on the elliptical or stair stepper to promote blood flow.',
    steps: [
      { name: 'Cardio Primer', detail: '5 minutes on the elliptical or stair stepper to promote blood flow.' },
      { name: 'Arm Circles', detail: '10 forward, 10 backward to mobilize shoulders and rotator cuffs.' },
      { name: 'Torso Twists', detail: '10 each side to loosen the back after sitting in the cab.' },
      { name: 'Bodyweight Squats', detail: '15 reps to open the hips and wake up glutes.' }
    ]
  },
  gymSpecifics: [
    {
      title: 'Use the 30-Minute Circuit Room',
      icon: 'zap',
      tip: 'If short on time, use the dedicated 30-Minute Express Circuit room. It combines resistance machines with step boxes for a quick full-body routine.'
    },
    {
      title: 'Stretch Post-Workout',
      icon: 'shield',
      tip: 'Before getting back in the vehicle, spend 5 minutes stretching. Focus heavily on stretching the chest in a doorway/rack and doing standing quad/hip flexor stretches.'
    },
    {
      title: 'HydroMassage',
      icon: 'bed',
      tip: 'If holding a PF Black Card, utilize the HydroMassage beds or massage chairs post-workout to loosen up a stiff lower back after a long route.'
    }
  ]
};

export const FOUNDER_PROFILE = {
  name: 'AJ Risner',
  email: 'risnerathletics@gmail.com',
  credentials: 'ISSA Elite Trainer, CPT, Certified Strength & Conditioning Specialist',
  militaryBackground: 'Military Motor Transport (88M) Veteran',
  commercialExperience: 'Commercial Heavy Haul & Hazmat Linehaul Operator',
  quote:
    'The road will break your posture and drain your engine if you let it. We train with the rig, we master recovery, and we stay combat-ready for the long haul.',
  coachingProgram: {
    title: '1-on-1 Driver Tactical Human Performance',
    email: 'risnerathletics@gmail.com',
    responseSla: 'Direct reply from Coach AJ within 24-48 hours between road shifts',
    description:
      'Personalized remote coaching designed for linehaul and OTR drivers: individualized programming around your specific cab layout, trailer types, shift schedules, custom running coaching (available separately 1-on-1 upon request), and truck stop nutrition strategy.'
  },
  pillars: [
    {
      title: 'Zero Gym Dependency',
      description: 'You carry everything you need: your bodyweight, your rig frame, a single band, or a light pair of dumbbells stowed in the bunk.'
    },
    {
      title: 'Postural Realignment',
      description: 'Engineered specifically to counteract the forward-head slouch, tight hip flexors, and compressed spine of 11-hour driving shifts.'
    },
    {
      title: 'Tactical Safety Protocols',
      description: 'Road training protocols built by professional drivers who know exactly where blind spots, fueling lanes, and security zones lie.'
    }
  ]
};
