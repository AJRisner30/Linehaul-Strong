import React, { useState } from 'react';
import { TruckStopChain, CabRecipe, FuelGrade } from '../types';
import { TRUCK_STOP_CHAINS, CAB_GALLEY_RECIPES } from '../data/nutritionData';
import { 
  Utensils, 
  Flame, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Check, 
  Apple, 
  Info,
  Clock,
  Zap
} from 'lucide-react';

interface CabGalleyNutritionViewProps {
  onContactCoach?: () => void;
}

export const CabGalleyNutritionView: React.FC<CabGalleyNutritionViewProps> = ({
  onContactCoach
}) => {
  const [subTab, setSubTab] = useState<'truck-stops' | 'cab-recipes'>('truck-stops');
  const [selectedChainId, setSelectedChainId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Recipe filters
  const [selectedAppliance, setSelectedAppliance] = useState<string>('all');
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const filteredChains = TRUCK_STOP_CHAINS.filter(chain => {
    if (selectedChainId !== 'all' && chain.id !== selectedChainId) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesChain = chain.name.toLowerCase().includes(query) || chain.tagline.toLowerCase().includes(query);
    const matchesWins = chain.greenLightWins.some(w => w.item.toLowerCase().includes(query) || w.macros.toLowerCase().includes(query));
    return matchesChain || matchesWins;
  });

  const filteredRecipes = CAB_GALLEY_RECIPES.filter(recipe => {
    if (selectedAppliance === 'all') return true;
    return recipe.appliance.toLowerCase().includes(selectedAppliance.toLowerCase());
  });

  const toggleIngredient = (recipeId: string, idx: number) => {
    const key = `${recipeId}-${idx}`;
    setCheckedIngredients(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getGradeBadge = (grade: FuelGrade) => {
    switch (grade) {
      case 'A':
      case 'A-':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'B+':
      case 'B':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'C+':
      case 'C':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#171D26] to-[#0F131A] border border-[#263345] rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#FF6B00] text-xs font-tactical uppercase tracking-wider mb-1">
              <Utensils className="w-4 h-4" />
              <span>ROAD FUEL ARCHITECTURE • CAB-GALLEY MASTERCLASS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-wide uppercase text-white">
              CAB-GALLEY NUTRITION & TRUCK STOP <span className="text-[#FF6B00]">"FUEL GRADES"</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl font-tactical mt-1">
              The number one hazard to a driver's career and cardiovascular health isn't lack of a gym—it's surviving on roller grill sodium traps and mega-sugar beverages. Here is your tactical blueprint for grabbing clean macros at high speed and prepping hot meals in your sleeper berth.
            </p>
          </div>

          {/* Sub Tab Controls */}
          <div className="flex items-center gap-2 bg-[#0B0E13] p-1.5 rounded-xl border border-[#202938] shrink-0 self-start lg:self-center">
            <button
              onClick={() => setSubTab('truck-stops')}
              className={`px-4 py-2 rounded-lg text-xs font-tactical font-black uppercase tracking-wider transition ${
                subTab === 'truck-stops'
                  ? 'bg-[#FF6B00] text-[#0D0F12] shadow-md shadow-[#FF6B00]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Truck Stop Fuel Grades
            </button>
            <button
              onClick={() => setSubTab('cab-recipes')}
              className={`px-4 py-2 rounded-lg text-xs font-tactical font-black uppercase tracking-wider transition ${
                subTab === 'cab-recipes'
                  ? 'bg-[#FF6B00] text-[#0D0F12] shadow-md shadow-[#FF6B00]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              12V Cab-Galley Recipes
            </button>
          </div>
        </div>
      </div>

      {/* ======================= */}
      {/* 1. TRUCK STOP DATABASE  */}
      {/* ======================= */}
      {subTab === 'truck-stops' && (
        <div className="space-y-6">
          {/* Controls & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111620] border border-[#1F2937] p-3 rounded-xl">
            {/* Chain Pills */}
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedChainId('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-tactical font-bold uppercase whitespace-nowrap transition border ${
                  selectedChainId === 'all'
                    ? 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]'
                    : 'bg-[#18202C] text-slate-400 border-transparent hover:text-white'
                }`}
              >
                All Chains ({TRUCK_STOP_CHAINS.length})
              </button>
              {TRUCK_STOP_CHAINS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChainId(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-tactical font-bold uppercase whitespace-nowrap transition border ${
                    selectedChainId === c.id
                      ? 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]'
                      : 'bg-[#18202C] text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search food item, eggs, chicken..."
                className="w-full bg-[#18202C] border border-[#273549] text-white text-xs rounded-lg pl-9 pr-3 py-2 placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>

          {/* Chain Cards Grid */}
          <div className="grid grid-cols-1 gap-6">
            {filteredChains.map(chain => (
              <div
                key={chain.id}
                className="bg-[#121722] border border-[#222E3F] rounded-2xl p-5 sm:p-6 transition hover:border-[#2D3D54] shadow-lg"
              >
                {/* Chain Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow"
                      style={{ backgroundColor: chain.logoColor }}
                    >
                      {chain.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-heading font-black text-white uppercase tracking-wider">
                          {chain.name}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs font-tactical font-black uppercase border ${getGradeBadge(
                            chain.overallHealthGrade
                          )}`}
                        >
                          FUEL GRADE: {chain.overallHealthGrade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-tactical mt-0.5">{chain.tagline}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-tactical uppercase tracking-wider text-slate-400 block">
                      RECOMMENDED SELECTION STRATEGY
                    </span>
                    <span className="text-xs font-semibold text-[#FF6B00] font-tactical">
                      Cold Vault First • Hot Roller Bypass
                    </span>
                  </div>
                </div>

                {/* 3 Columns: Green Light, Yellow Light, Red Light */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
                  {/* Green Light Wins */}
                  <div className="bg-[#0D121A] border border-emerald-500/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 border-b border-emerald-500/20 pb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-tactical font-black uppercase tracking-wider">
                        GREEN LIGHT WINS (BUY THESE)
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {chain.greenLightWins.map((win, idx) => (
                        <div key={idx} className="bg-[#141B26] p-3 rounded-lg border border-[#202C3E]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white leading-tight">{win.item}</span>
                            <span className="text-[10px] font-tactical px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 shrink-0">
                              {win.category}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono font-bold text-[#FF6B00] mt-1">
                            {win.macros}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 italic font-tactical">
                            "{win.proTip}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Yellow Light Cautious */}
                  <div className="bg-[#0D121A] border border-amber-500/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 border-b border-amber-500/20 pb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-tactical font-black uppercase tracking-wider">
                        YELLOW LIGHT (WITH MODIFICATIONS)
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {chain.yellowLightCautious.map((caut, idx) => (
                        <div key={idx} className="bg-[#141B26] p-3 rounded-lg border border-[#202C3E]">
                          <span className="text-xs font-bold text-amber-200 block">{caut.item}</span>
                          <p className="text-[11px] text-slate-400 mt-1 font-tactical leading-relaxed">
                            {caut.caveat}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Red Light Traps */}
                  <div className="bg-[#0D121A] border border-rose-500/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 border-b border-rose-500/20 pb-2">
                      <Flame className="w-4 h-4" />
                      <span className="text-xs font-tactical font-black uppercase tracking-wider">
                        RED LIGHT ROAD TRAPS (AVOID)
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {chain.redLightTraps.map((trap, idx) => (
                        <div key={idx} className="bg-[#141B26] p-3 rounded-lg border border-[#202C3E]">
                          <span className="text-xs font-bold text-rose-300 block">{trap.item}</span>
                          <p className="text-[11px] text-slate-400 mt-1 font-tactical leading-relaxed">
                            <strong className="text-rose-400">Hazard:</strong> {trap.hazard}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AJ Risner's Verdict */}
                <div className="mt-4 p-3.5 bg-[#171F2C] border-l-4 border-[#FF6B00] rounded-r-xl text-xs text-slate-300 font-tactical leading-relaxed flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <div>{chain.ajVerdict}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* 2. 12V CAB-GALLEY RECIPES TAB  */}
      {/* ============================== */}
      {subTab === 'cab-recipes' && (
        <div className="space-y-6">
          {/* Appliance Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-[#111620] border border-[#1F2937] p-3 rounded-xl">
            <span className="text-xs font-tactical text-slate-400 uppercase tracking-wider mr-2">
              APPLIANCE RIG:
            </span>
            {[
              { id: 'all', label: 'All Appliances' },
              { id: 'Skillet', label: '12V RoadPro Skillet' },
              { id: 'Microwave', label: 'Truck Inverter Microwave' },
              { id: 'Slow Cooker', label: 'Mini Slow Cooker' },
              { id: 'Cooler', label: 'No-Cook 12V Cooler' }
            ].map(app => (
              <button
                key={app.id}
                onClick={() => setSelectedAppliance(app.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-tactical font-bold uppercase transition border ${
                  selectedAppliance === app.id
                    ? 'bg-[#FF6B00] text-[#0D0F12] border-[#FF6B00]'
                    : 'bg-[#18202C] text-slate-300 border-transparent hover:text-white'
                }`}
              >
                {app.label}
              </button>
            ))}
          </div>

          {/* Recipes List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRecipes.map(recipe => (
              <div
                key={recipe.id}
                className="bg-[#121722] border border-[#222E3F] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Badge & Timing */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
                    <span className="px-2.5 py-1 rounded bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 text-[11px] font-tactical font-black uppercase">
                      {recipe.appliance}
                    </span>
                    <div className="flex items-center gap-3 text-xs font-tactical text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        PREP: {recipe.prepTimeMinutes}m
                      </span>
                      <span>•</span>
                      <span>COOK: {recipe.cookTimeMinutes}m</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-heading font-black text-white uppercase tracking-wide mt-3">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-tactical mt-0.5">{recipe.subtitle}</p>

                  {/* Macro Dashboard */}
                  <div className="grid grid-cols-5 gap-2 my-4 bg-[#0A0D12] p-2.5 rounded-xl border border-[#1A222E] text-center">
                    <div>
                      <span className="text-[10px] font-tactical text-slate-400 block uppercase">PROTEIN</span>
                      <span className="text-sm font-mono font-bold text-emerald-400">{recipe.proteinGrams}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-tactical text-slate-400 block uppercase">CARBS</span>
                      <span className="text-sm font-mono font-bold text-sky-400">{recipe.carbGrams}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-tactical text-slate-400 block uppercase">FAT</span>
                      <span className="text-sm font-mono font-bold text-amber-400">{recipe.fatGrams}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-tactical text-slate-400 block uppercase">CALORIES</span>
                      <span className="text-sm font-mono font-bold text-white">{recipe.calories}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-tactical text-slate-400 block uppercase">SODIUM</span>
                      <span className="text-sm font-mono font-bold text-slate-300">{recipe.sodiumMg}mg</span>
                    </div>
                  </div>

                  {/* Shelf life tag */}
                  <div className="text-[11px] font-tactical text-slate-400 mb-4 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span><strong>Sleeper Shelf-Life:</strong> {recipe.shelfLifeBunk}</span>
                  </div>

                  {/* Ingredients Checklist */}
                  <div className="space-y-2 mb-4">
                    <span className="text-xs font-tactical font-black uppercase tracking-wider text-slate-300 block">
                      CAB INGREDIENTS (TAP TO CHECK OFF):
                    </span>
                    <div className="space-y-1.5">
                      {recipe.ingredients.map((ing, idx) => {
                        const isChecked = !!checkedIngredients[`${recipe.id}-${idx}`];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleIngredient(recipe.id, idx)}
                            className={`flex items-start gap-2 text-xs p-2 rounded-lg cursor-pointer transition border ${
                              isChecked
                                ? 'bg-emerald-950/20 text-emerald-300/70 border-emerald-900/40 line-through'
                                : 'bg-[#161D27] text-slate-200 border-[#222E3F] hover:border-slate-500'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                                isChecked
                                  ? 'bg-emerald-500 border-emerald-400 text-black'
                                  : 'border-slate-500 bg-[#0E131A]'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{ing}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2 mb-4">
                    <span className="text-xs font-tactical font-black uppercase tracking-wider text-slate-300 block">
                      IN-CAB EXECUTION:
                    </span>
                    <ol className="space-y-1.5 list-decimal list-inside text-xs text-slate-300 font-tactical leading-relaxed">
                      {recipe.instructions.map((step, idx) => (
                        <li key={idx} className="bg-[#0F141D] p-2 rounded border border-[#1C2533]">
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* AJ Coaching Cue */}
                <div className="p-3 bg-[#171F2C] border-l-4 border-[#FF6B00] rounded-r-xl text-xs text-slate-300 font-tactical leading-relaxed flex items-start gap-2">
                  <Zap className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <div>{recipe.ajCoachingCue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct Coach Help */}
      <div className="p-4 rounded-xl bg-[#111721] border border-[#212C3C] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-tactical">
        <div className="flex items-center gap-3">
          <Apple className="w-5 h-5 text-[#FF6B00] shrink-0" />
          <span className="text-slate-300">
            Need a personalized roadside meal prep plan or diabetes/blood pressure strategy? AJ Risner coaches drivers 1-on-1 via remote dispatch.
          </span>
        </div>
        {onContactCoach && (
          <button
            onClick={onContactCoach}
            className="shrink-0 px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#E05E00] text-[#0D0F12] font-black uppercase transition"
          >
            Inquire With AJ
          </button>
        )}
      </div>
    </div>
  );
};
