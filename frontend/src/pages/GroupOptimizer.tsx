import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  PieChart as PieIcon,
  Compass,
  ArrowRight
} from 'lucide-react';
import { aiAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface Member {
  name: string;
  budget: number;
  interests: string[];
}

export const GroupOptimizer: React.FC = () => {
  const [destination, setDestination] = useState<string>('jaipur');
  const [numDays, setNumDays] = useState<number>(3);
  const [members, setMembers] = useState<Member[]>([
    { name: 'Gaurang (History & Architecture)', budget: 20000, interests: ['historical', 'cultural'] },
    { name: 'Ishant (Adventure & Nature)', budget: 15000, interests: ['adventure', 'nature'] },
    { name: 'Hardik (Food & Bazaars)', budget: 25000, interests: ['food', 'shopping'] },
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  const interestTags = ['historical', 'cultural', 'nature', 'adventure', 'food', 'shopping', 'religious'];

  const addMember = () => {
    if (members.length < 6) {
      setMembers([
        ...members,
        { name: `Traveler ${members.length + 1}`, budget: 20000, interests: ['historical'] }
      ]);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > 2) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: string, val: any) => {
    const updated = [...members];
    (updated[index] as any)[field] = val;
    setMembers(updated);
  };

  const toggleMemberInterest = (memberIdx: number, interest: string) => {
    const current = members[memberIdx].interests;
    if (current.includes(interest)) {
      if (current.length > 1) {
        updateMember(memberIdx, 'interests', current.filter((i) => i !== interest));
      }
    } else {
      updateMember(memberIdx, 'interests', [...current, interest]);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const payload = {
        destination,
        num_days: numDays,
        budget: members.reduce((sum, m) => sum + m.budget, 0),
        group_members: members,
      };
      const res = await aiAPI.groupOptimize(payload);
      setResult(res);
    } catch (e: any) {
      alert(`Optimization error: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-navy-900 tracking-tight">
            Group Trip Planner
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Add everyone's interests and budget, and we'll build a trip that works for the whole group.
          </p>
        </div>

        <Button
          onClick={handleOptimize}
          loading={loading}
          icon={<Sparkles className="w-3.5 h-3.5" />}
        >
          Build group itinerary
        </Button>
      </div>

      {/* Member Input Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-navy-900">
            Group Members & Individual Profiles ({members.length})
          </h3>
          <Button
            size="sm"
            variant="secondary"
            onClick={addMember}
            icon={<Plus className="w-3.5 h-3.5" />}
            disabled={members.length >= 6}
          >
            Add Member
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.map((m, idx) => (
            <Card key={idx} className="p-5 space-y-4 border-gray-200">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-xs font-mono">
                  0{idx + 1}
                </span>
                {members.length > 2 && (
                  <button
                    onClick={() => removeMember(idx)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">
                  Traveler Name / Persona
                </label>
                <input
                  type="text"
                  value={m.name}
                  onChange={(e) => updateMember(idx, 'name', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-navy-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">
                  Budget (₹{m.budget.toLocaleString('en-IN')})
                </label>
                <input
                  type="range"
                  min="10000"
                  max="50000"
                  step="2500"
                  value={m.budget}
                  onChange={(e) => updateMember(idx, 'budget', parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1.5">
                  Interests
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {interestTags.map((tag) => {
                    const active = m.interests.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleMemberInterest(idx, tag)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                          active
                            ? 'bg-primary text-white'
                            : 'bg-surface text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Harmony Index Metric */}
          <div className="p-6 rounded-3xl bg-navy-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal">
                Group Harmony Index
              </span>
              <div className="text-4xl font-black font-display text-white mt-1">
                {result.overall_group_harmony_index}% Satisfaction
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Calculated across all travelers through weighted interest overlap.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {Object.entries(result.group_satisfaction_summary || {}).map(([name, data]: any) => (
                <div key={name} className="p-3 rounded-xl bg-navy-800 border border-navy-700 text-center min-w-[100px]">
                  <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{name.split(' ')[0]}</div>
                  <div className="text-sm font-bold text-teal mt-0.5">{data.satisfaction_percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Balanced Days Schedule */}
          {result.itinerary && (
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-base text-navy-900">
                Group Itinerary ({result.itinerary.days?.length} Days)
              </h3>
              <div className="space-y-4">
                {result.itinerary.days?.map((day: any) => (
                  <div key={day.day_number} className="p-4 rounded-2xl bg-surface border border-gray-100 space-y-3">
                    <div className="font-bold text-xs text-primary font-mono">Day {day.day_number} Schedule</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {day.activities?.map((act: any) => (
                        <div key={act.attraction_id} className="p-3 rounded-xl bg-white border border-gray-200 text-xs space-y-1">
                          <span className="text-[10px] font-mono text-gray-400">{act.time_window}</span>
                          <div className="font-bold text-navy-900">{act.name}</div>
                          <Badge variant="teal" size="sm">{act.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

