import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Clock, 
  Award, 
  ShieldCheck, 
  Dumbbell, 
  MessageSquare, 
  Truck, 
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { FOUNDER_PROFILE } from '../data/protocols';

interface CoachContactViewProps {
  onNavigateToCustomPlan?: () => void;
}

export const CoachContactView: React.FC<CoachContactViewProps> = ({
  onNavigateToCustomPlan
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<'coaching' | 'running' | 'question' | 'fleet'>('coaching');

  // Form state
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [rigType, setRigType] = useState('Linehaul / OTR Semi-Truck');
  const [currentGear, setCurrentGear] = useState('Resistance Band + Light DBs');
  const [messageText, setMessageText] = useState('');
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  const contactEmail = 'risnerathletics@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const getSubjectLine = () => {
    switch (selectedTopic) {
      case 'coaching':
        return `[Linehaul Strong] 1-on-1 Road Strength Coaching Inquiry: ${driverName || 'Driver'}`;
      case 'running':
        return `[Linehaul Strong] 1-on-1 Running & Cardio Coaching Inquiry: ${driverName || 'Driver'}`;
      case 'question':
        return `[Linehaul Strong] Road Training / Injury Question: ${driverName || 'Driver'}`;
      case 'fleet':
        return `[Linehaul Strong] Fleet Operator Performance Inquiry: ${driverName || 'Fleet Lead'}`;
      default:
        return `[Linehaul Strong] Inquiry for Coach AJ Risner`;
    }
  };

  const generateEmailBody = () => {
    return `Coach AJ,

Name: ${driverName || 'N/A'}
Contact Email: ${driverEmail || 'N/A'}
Driving Division / Rig: ${rigType}
Equipment Stowed: ${currentGear}
Topic: ${selectedTopic.toUpperCase()}

Message / Operational Goals:
${messageText || 'I am interested in learning more about your 1-on-1 coaching program for commercial drivers.'}

Sent via Linehaul Strong Driver Terminal.`;
  };

  const handleOpenMailClient = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(getSubjectLine());
    const body = encodeURIComponent(generateEmailBody());
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    setDispatchedSuccess(true);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(`Subject: ${getSubjectLine()}\n\nTo: ${contactEmail}\n\n${generateEmailBody()}`);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Contact Header */}
      <div className="bg-[#12161E] border-2 border-[#222B38] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Orange Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#FF6B00] text-[#0D0F12] text-xs font-tactical font-black uppercase tracking-wider">
                DIRECT DISPATCH
              </span>
              <span className="text-xs font-tactical text-slate-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                REPLY SLA: 24–48 HRS BETWEEN ROUTES
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading tracking-wide">
              Questions & 1-on-1 Driver Coaching
            </h2>

            <p className="text-sm text-[#94A3B8] max-w-xl leading-relaxed">
              Get direct operational guidance from founder <strong className="text-white font-semibold">AJ Risner</strong>. Whether you have questions regarding the Rest Stop or Light DB protocols, need injury and posture mitigation, or want tailored 1-on-1 coaching for the road.
            </p>
          </div>

          {/* Primary Quick Direct Email Card */}
          <div className="bg-[#171D27] border border-[#2B3647] rounded-xl p-4 sm:p-5 shrink-0 w-full md:w-auto shadow-lg">
            <span className="text-[11px] font-tactical text-slate-400 uppercase tracking-wider block mb-1">
              DIRECT COACHING INBOX
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${contactEmail}`}
                className="text-base sm:text-lg font-mono font-bold text-[#FF6B00] hover:underline flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                {contactEmail}
              </a>
              <button
                onClick={handleCopyEmail}
                className="p-1.5 rounded-lg bg-[#202836] hover:bg-[#2A3446] text-slate-300 transition border border-[#2F3C4E]"
                title="Copy Email Address"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct access to AJ Risner (ISSA Elite Trainer)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Contact Dispatch Form & 1-on-1 Program Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Dispatch Form */}
        <div className="lg:col-span-7 bg-[#12151B] border border-[#222834] rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#1D2430] mb-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="text-lg font-black uppercase text-white font-heading tracking-wide">
                Send a Dispatch to Coach AJ
              </h3>
            </div>
            <span className="text-[11px] font-tactical text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded border border-[#FF6B00]/30">
              NO SPAM • DRIVERS FIRST
            </span>
          </div>

          {/* Topic Selector Tabs */}
          <div className="mb-5">
            <label className="text-xs font-tactical uppercase text-slate-400 block mb-2 font-semibold">
              Select Purpose of Dispatch:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTopic('coaching')}
                className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition border ${
                  selectedTopic === 'coaching'
                    ? 'bg-[#FF6B00] text-[#0D0F12] border-[#FF6B00] shadow-md shadow-[#FF6B00]/20'
                    : 'bg-[#181D26] text-slate-400 border-[#252E3D] hover:text-white hover:bg-[#1E2430]'
                }`}
              >
                1-on-1 Road
              </button>
              <button
                type="button"
                onClick={() => setSelectedTopic('running')}
                className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition border ${
                  selectedTopic === 'running'
                    ? 'bg-[#FF6B00] text-[#0D0F12] border-[#FF6B00] shadow-md shadow-[#FF6B00]/20'
                    : 'bg-[#181D26] text-slate-400 border-[#252E3D] hover:text-white hover:bg-[#1E2430]'
                }`}
              >
                Running Coaching
              </button>
              <button
                type="button"
                onClick={() => setSelectedTopic('question')}
                className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition border ${
                  selectedTopic === 'question'
                    ? 'bg-[#FF6B00] text-[#0D0F12] border-[#FF6B00] shadow-md shadow-[#FF6B00]/20'
                    : 'bg-[#181D26] text-slate-400 border-[#252E3D] hover:text-white hover:bg-[#1E2430]'
                }`}
              >
                Ask Question
              </button>
              <button
                type="button"
                onClick={() => setSelectedTopic('fleet')}
                className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition border ${
                  selectedTopic === 'fleet'
                    ? 'bg-[#FF6B00] text-[#0D0F12] border-[#FF6B00] shadow-md shadow-[#FF6B00]/20'
                    : 'bg-[#181D26] text-slate-400 border-[#252E3D] hover:text-white hover:bg-[#1E2430]'
                }`}
              >
                Fleet Ops
              </button>
            </div>

            {selectedTopic === 'running' && (
              <div className="mt-3 p-3 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-xs font-tactical text-slate-200">
                <span className="font-bold text-[#FF6B00] block mb-0.5">Separate 1-on-1 Running & Aerobic Conditioning:</span>
                Coach AJ develops personalized running and road cardio programs separately on an individual basis. Tailored around your current fitness base, joint health, and route layover schedules.
              </div>
            )}
          </div>

          <form onSubmit={handleOpenMailClient} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-tactical text-slate-300 block mb-1">
                  Driver Name / Handle:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., AJ or Big Rig 88"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-[#181D26] border border-[#2B3545] rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="text-xs font-tactical text-slate-300 block mb-1">
                  Your Email Address:
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g., driver@company.com"
                  value={driverEmail}
                  onChange={(e) => setDriverEmail(e.target.value)}
                  className="w-full bg-[#181D26] border border-[#2B3545] rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-tactical text-slate-300 block mb-1">
                  Haul Type / Route Division:
                </label>
                <select
                  value={rigType}
                  onChange={(e) => setRigType(e.target.value)}
                  className="w-full bg-[#181D26] border border-[#2B3545] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="Hazmat Linehaul">Hazmat Linehaul (Night Shift)</option>
                  <option value="Commercial Heavy Haul / Oversize">Heavy Haul / Oversize</option>
                  <option value="OTR Dry Van / Reefer">OTR (48-State Van / Reefer)</option>
                  <option value="Flatbed / Cargo Securing">Flatbed / Specialized</option>
                  <option value="Day Cab / Local P&D">Day Cab / Local P&D</option>
                  <option value="Military / Tactical Transport">Military / Tactical Logistics Transport</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-tactical text-slate-300 block mb-1">
                  Available Gear on the Rig:
                </label>
                <select
                  value={currentGear}
                  onChange={(e) => setCurrentGear(e.target.value)}
                  className="w-full bg-[#181D26] border border-[#2B3545] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="Resistance Band + Rig Frame Only">Resistance Band + Rig Steps Only</option>
                  <option value="Light Dumbbells (10-25 lbs) + Band">Light Dumbbells (10-25 lbs) + Band</option>
                  <option value="Bodyweight & Truck Frame Only">Bodyweight & Truck Frame Only</option>
                  <option value="Kettlebell / Adjustable Dumbbells">Adjustable Dumbbells / Kettlebell</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-tactical text-slate-300 block mb-1">
                Your Goals, Questions, or Physical Road Pain Points:
              </label>
              <textarea
                rows={4}
                required
                placeholder="Tell Coach AJ about your current shift schedule, injuries (e.g., lower back stiffness, rounded shoulders, knee ache), or your goal for 1-on-1 coaching..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full bg-[#181D26] border border-[#2B3545] rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
              ></textarea>
            </div>

            {dispatchedSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Email client opened with your dispatch to <strong>{contactEmail}</strong>. You can also copy the draft text below.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto flex-1 bg-[#FF6B00] hover:bg-[#E05E00] text-[#0D0F12] font-black font-tactical py-3 px-6 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-[#FF6B00]/20"
              >
                <Send className="w-4 h-4" />
                <span>Launch Email to Coach AJ</span>
              </button>

              <button
                type="button"
                onClick={handleCopyDraft}
                className="w-full sm:w-auto bg-[#1C222E] hover:bg-[#252E3E] text-slate-200 border border-[#2F3A4C] font-tactical font-semibold py-3 px-5 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition"
              >
                {copiedDraft ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedDraft ? 'Draft Copied!' : 'Copy Dispatch Text'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: 1-on-1 Coaching Curriculum & Credentials */}
        <div className="lg:col-span-5 space-y-4">
          {/* Coaching Pillar Card */}
          <div className="bg-[#12161E] border border-[#222834] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1E2532]">
              <Award className="w-5 h-5 text-[#FF6B00]" />
              <h4 className="text-base font-black uppercase text-white font-heading tracking-wide">
                1-on-1 Remote Road Coaching
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Designed specifically for commercial drivers battling the brutal reality of 70-hour work weeks, tight dock deadlines, and truck stop food deserts.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#181D26] border border-[#252E3D]">
                <Dumbbell className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Custom Rig & Sleeper Programming</strong>
                  <span>Workouts programmed specifically around your sleeper dimensions, cab ingress steps, and stowed equipment.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#181D26] border border-[#252E3D]">
                <Truck className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Truck Stop Nutrition & Cab Meal Prep</strong>
                  <span>No fake bodybuilder diets. Realistic macro strategies that work inside a 12-volt truck fridge and microwave.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#181D26] border border-[#252E3D]">
                <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Direct Driver Accountability</strong>
                  <span>Regular check-ins and protocol adjustments tailored to your dispatch schedules, 10-hour breaks, and 34-hour resets.</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#1C2330] to-[#121721] border border-[#FF6B00]/30 text-xs">
              <div className="flex items-center gap-2 text-[#FF6B00] font-tactical font-black uppercase mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Coach AJ Risner</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                "I've spent years in commercial linehaul and heavy haul, and served in military motor transport. I don't give drivers advice from an air-conditioned gym office. Every protocol is field-tested for the realities of the road."
              </p>
            </div>

            {onNavigateToCustomPlan && (
              <button
                type="button"
                onClick={onNavigateToCustomPlan}
                className="w-full py-3 px-4 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider transition shadow-lg shadow-[#FF6B00]/20 flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 fill-current" />
                <span>Sign Up for 1-on-1 Coaching & Custom Plan</span>
              </button>
            )}
          </div>

          {/* Quick FAQ / Questions Accordion */}
          <div className="bg-[#12151B] border border-[#222834] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E2532]">
              <HelpCircle className="w-4 h-4 text-[#FF6B00]" />
              <h4 className="text-sm font-bold uppercase text-white font-heading tracking-wide">
                Common Questions
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-[#171C25] border border-[#232B39]">
                <span className="font-bold text-white block mb-1">Do I need gym access for coaching?</span>
                <span className="text-slate-400 leading-relaxed">
                  Zero gym access needed. All training uses bodyweight, the rig frame, resistance bands, or a single light pair of dumbbells.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#171C25] border border-[#232B39]">
                <span className="font-bold text-white block mb-1">How fast does Coach AJ respond?</span>
                <span className="text-slate-400 leading-relaxed">
                  All messages sent to <code className="text-[#FF6B00]">{contactEmail}</code> are reviewed and answered within 24–48 hours between operational driving shifts.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
