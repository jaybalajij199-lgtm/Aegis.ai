import React, { useState, useEffect } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Activity,
  Send,
  Globe
} from 'lucide-react';

interface AudioPreset {
  id: string;
  language: 'ODIA' | 'HINDI' | 'ENGLISH';
  title: string;
  transcript: string;
  location: string;
  affected: number;
  panicScore: number;
  district: string;
  lat: number;
  lng: number;
}

const SAMPLE_AUDIO_PRESETS: AudioPreset[] = [
  {
    id: 'ODIA_PRESET_01',
    language: 'ODIA',
    title: 'Odia Emergency Call - Medical Ward Flood Inundation',
    transcript: 'ମେଡିକାଲ୍ ୱାର୍ଡ ରେ ପାଣି ପସିଗଲାଣି! ୧୨ ଜଣ ରୋଗୀ ଅଟକି ରହିଛନ୍ତି। ବୋଟ୍ ପଠାନ୍ତୁ! (Water has flooded the Ward! 12 patients trapped. Send motorboats immediately!)',
    location: 'Medical College',
    district: 'Regional District 1',
    affected: 12,
    panicScore: 92,
    lat: 20.469,
    lng: 85.88
  },
  {
    id: 'HINDI_PRESET_02',
    language: 'HINDI',
    title: 'Hindi Distress Call - Embankment Breach',
    transcript: 'तटबंध टूट गया है! 30 परिवार छत पर फंस गए हैं! पानी 6 फीट ऊपर बह रहा है! (Embankment breached! 30 families trapped on roof!)',
    location: 'Flood Plain Sector',
    district: 'Regional District 2',
    affected: 30,
    panicScore: 96,
    lat: 20.4625,
    lng: 85.8828
  },
  {
    id: 'ENG_PRESET_03',
    language: 'ENGLISH',
    title: 'English Radio SOS - Submerged Ambulance & Pregnant Patient',
    transcript: 'Mayday Mayday! Emergency ambulance submerged near highway spillway. Pregnant mother inside needing immediate evacuation boat!',
    location: 'Highway Spillway',
    district: 'Regional District 3',
    affected: 3,
    panicScore: 98,
    lat: 20.448,
    lng: 85.815
  }
];

export const AcousticVoiceAnalyzer: React.FC = () => {
  const { createEmergencyRequest, currentUser, emergencies } = useAegisStore();
  const voiceEmergencies = emergencies.filter(e => e.voiceNoteUrl);

  const [selectedEmergency, setSelectedEmergency] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  useEffect(() => {
    if (voiceEmergencies.length > 0 && !selectedEmergency) {
      setSelectedEmergency(voiceEmergencies[0]);
    }
  }, [voiceEmergencies, selectedEmergency]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    language: string;
    transcript: string;
    location: string;
    panicScore: number;
    acousticProfile: string;
    extractedCasualties: number;
    recommendedAction: string;
  } | null>(null);

  const [sosCreatedMsg, setSosCreatedMsg] = useState<string>('');

  // Waveform heights state for animation
  const [waveBars, setWaveBars] = useState<number[]>([
    20, 40, 65, 30, 85, 95, 40, 70, 90, 30, 60, 80, 45, 90, 35, 75, 50, 85, 30, 60
  ]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setWaveBars(
          Array.from({ length: 20 }, () => Math.floor(Math.random() * 75) + 20)
        );
      }, 120);
    } else {
      setWaveBars([20, 30, 25, 20, 35, 20, 30, 25, 20, 30, 20, 25, 20, 30, 20, 25, 20, 30, 20, 25]);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleRunVoiceAnalysis = async () => {
    setIsPlaying(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    // Play the recorded audio locally so the operator can hear it
    let audio: HTMLAudioElement | null = null;
    if (selectedEmergency?.voiceNoteUrl) {
      audio = new Audio(selectedEmergency.voiceNoteUrl);
      audio.play().catch(e => console.warn('Could not play audio', e));
    }

    try {
      const res = await fetch('/api/ai/samvaad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioPayload: selectedEmergency.voiceNoteUrl,
          language: 'Unknown',
          location: selectedEmergency.location.address
        })
      });
      const data = await res.json();
      
      setIsPlaying(false);
      setIsAnalyzing(false);
      if (audio) {
        audio.pause();
      }
      
      if (data.success) {
        setAnalysisResult({
          language: data.data.language,
          transcript: data.data.transcript,
          location: data.data.location,
          panicScore: data.data.panicScore,
          acousticProfile: data.data.acousticProfile,
          extractedCasualties: selectedEmergency.peopleAffected, // Preserve mock preset value
          recommendedAction: data.data.recommendedAction
        });
      }
    } catch (e) {
      setIsPlaying(false);
      setIsAnalyzing(false);
      if (audio) audio.pause();
      console.error(e);
    }
  };

  const handleConvertVoiceToSOS = async () => {
    if (!analysisResult) return;

    const req = await createEmergencyRequest({
      reporterName: currentUser.name,
      reporterPhone: currentUser.phone || '+91 94370 00000',
      reporterRole: 'CITIZEN',
      disasterType: 'FLOOD',
      description: `[ACOUSTIC VOICE SOS - ${analysisResult.language}] ${analysisResult.transcript}`,
      peopleAffected: analysisResult.extractedCasualties,
      injuredCount: 2,
      childrenCount: 3,
      seniorCount: 2,
      hasFoodShortage: true,
      hasWaterShortage: true,
      location: {
        state: 'Odisha',
        district: selectedEmergency.location.district,
        address: analysisResult.location,
        lat: selectedEmergency.location.lat,
        lng: selectedEmergency.location.lng
      },
      roadAccessAvailable: false
    });

    setSosCreatedMsg(
      `Voice Distress Clip automatically parsed and published as CRITICAL SOS Incident #${req.id} into Mission Control Queue!`
    );

    setTimeout(() => setSosCreatedMsg(''), 4000);
  };

  return (
    <Card variant="glass" className="p-5 border-blue-200 space-y-4 font-sans text-xs relative shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-950 text-purple-400 rounded-xl border border-purple-800">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 font-mono text-[10px]">
              <span className="text-purple-400 font-bold uppercase">ACOUSTIC EMERGENCY VOICE INTELLIGENCE</span>
              <span className="text-slate-500">•</span>
              <span className="text-blue-700 font-bold">SARVAM SAMVAAD AUDIO-TO-INTENT ENGINE</span>
            </div>
            <h2 className="text-sm font-bold text-white font-heading">
              Voice SOS & Regional Language Distress Audio Analyzer
            </h2>
          </div>
        </div>

        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-bold flex items-center">
          <Globe className="h-3 w-3 mr-1 text-blue-600" /> Odia / Hindi / English Supported
        </span>
      </div>

      {/* SOS Voice Note Selector */}
      <div className="space-y-2 font-mono">
        <label className="text-slate-700 font-bold text-[11px]">Select Incoming SOS Voice Broadcast:</label>
        {voiceEmergencies.length === 0 ? (
          <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 text-xs text-center">
            No live voice SOS emergencies in queue. Send a voice note from Citizen app.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto no-scrollbar">
            {voiceEmergencies.map((emg: any) => (
              <button
                key={emg.id}
                onClick={() => {
                  setSelectedEmergency(emg);
                  setAnalysisResult(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedEmergency?.id === emg.id
                    ? 'bg-purple-950/80 border-purple-500/80 text-white shadow-lg'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                  <span className="text-purple-300">SOS #{emg.id}</span>
                  <span className="text-rose-400">Wait: {emg.waitingTimeMinutes}m</span>
                </div>
                <p className="font-bold text-xs truncate">{emg.reporterName} - {emg.location.district}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Audio Waveform Visualizer */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 font-mono">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-600 flex items-center">
            <Volume2 className="h-4 w-4 mr-1 text-purple-400" /> Audio Frequency Stream
          </span>
          <span className="text-slate-500 text-[10px]">Sampling Rate: 48 kHz PCM</span>
        </div>

        {/* Waveform Bar Graphic */}
        <div className="h-16 flex items-center justify-center space-x-1.5 bg-white/80 rounded-xl p-2 border border-slate-200">
          {waveBars.map((height, i) => (
            <div
              key={i}
              style={{ height: `${height}%` }}
              className={`w-2 rounded-full transition-all duration-100 ${
                isPlaying
                  ? 'bg-gradient-to-t from-purple-600 via-cyan-400 to-rose-500'
                  : 'bg-slate-100'
              }`}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunVoiceAnalysis}
            disabled={isAnalyzing}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4"
          >
            <Sparkles className={`h-4 w-4 mr-1.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing Audio with Sarvam Samvaad...' : 'Analyze Audio & Extract Intent'}
          </Button>

          <span className="text-[10px] text-slate-500 italic">
            "Base64 Audio Segment Attached..."
          </span>
        </div>
      </div>

      {/* Analysis Result Display */}
      {analysisResult && (
        <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-2xl space-y-3 font-mono text-xs animate-fadeIn">
          <div className="flex items-center justify-between border-b border-purple-800/80 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="font-bold text-white text-xs">Sarvam Samvaad Acoustic Speech Extraction</span>
            </div>
            <Badge priority="CRITICAL">PANIC SCORE: {analysisResult.panicScore}/100</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
            <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Detected Language</span>
              <strong className="text-purple-300 font-bold">{analysisResult.language}</strong>
            </div>

            <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Acoustic Environment</span>
              <strong className="text-rose-300 font-bold">{analysisResult.acousticProfile}</strong>
            </div>

            <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Extracted Casualties</span>
              <strong className="text-white font-bold">{analysisResult.extractedCasualties} trapped citizens</strong>
            </div>
          </div>

          <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Recommended Triage Protocol</span>
            <p className="text-slate-800 font-bold">{analysisResult.recommendedAction}</p>
          </div>

          {/* Create SOS Action */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-600">
              Clicking convert automatically publishes this voice clip as a structured SOS.
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={handleConvertVoiceToSOS}
              className="bg-blue-600 hover:bg-blue-600 text-slate-950 font-bold text-xs px-4"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Publish as Live SOS Incident
            </Button>
          </div>
        </div>
      )}

      {sosCreatedMsg && (
        <div className="p-3 bg-green-50/90 border border-green-500/50 rounded-xl text-emerald-200 font-mono text-center text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 inline mr-1.5 text-green-600" />
          {sosCreatedMsg}
        </div>
      )}
    </Card>
  );
};
