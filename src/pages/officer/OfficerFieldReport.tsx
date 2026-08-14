import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  FileText,
  CheckCircle2,
  ShieldAlert,
  Mic,
  Square,
  Camera,
  Radio,
  Send,
  Waves,
  Users,
  HeartPulse,
  Trash2,
  Image as ImageIcon,
  Play,
  Volume2
} from 'lucide-react';

export const OfficerFieldReport: React.FC = () => {
  const navigate = useNavigate();
  const { missions, updateMissionStatus, currentUser } = useAegisStore();

  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    missions[0]?.id || ''
  );
  const [newStatus, setNewStatus] = useState<any>('ON_SITE');
  const [evacuatedCount, setEvacuatedCount] = useState<number>(15);
  const [injuredCount, setInjuredCount] = useState<number>(4);
  const [waterCondition, setWaterCondition] = useState('Depth: 3.2m, Flow: 4.5 Knots High');
  const [logText, setLogText] = useState(
    'Deployed 2 motorboats in Jobra Sector. Rescued 15 citizens including 4 children trapped on rooftops. Administered first aid to 4 citizens with lacerations.'
  );

  // Voice recording state & refs
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasVoiceMemo, setHasVoiceMemo] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Photo state & refs
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [submitted, setSubmitted] = useState(false);

  const activeMission = missions.find((m) => m.id === selectedMissionId) || missions[0];

  // Clean up recording timer & audio stream on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Voice recording handler
  const handleToggleVoiceRecording = async () => {
    if (isRecordingVoice) {
      // STOP RECORDING
      setIsRecordingVoice(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      } else {
        // Fallback or simulated recording stop
        setHasVoiceMemo(true);
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    } else {
      // START RECORDING
      setRecordingSeconds(0);
      setAudioUrl(null);
      setHasVoiceMemo(false);
      audioChunksRef.current = [];

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;

          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            setHasVoiceMemo(true);
          };

          mediaRecorder.start(200);
        } else {
          // Fallback if mediaDevices not available
          setHasVoiceMemo(false);
        }
      } catch (err) {
        console.warn('Microphone permission blocked or unavailable, using simulated recording timer:', err);
      }

      setIsRecordingVoice(true);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const clearVoiceMemo = () => {
    setAudioUrl(null);
    setHasVoiceMemo(false);
    setRecordingSeconds(0);
  };

  // Photo upload handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoName('');
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMission) return;

    const fullMessage = `[GROUND TELEMETRY] Stage: ${newStatus} | Evacuated: ${evacuatedCount} citizens | Injured Treated: ${injuredCount} | Conditions: ${waterCondition} | Notes: ${logText}${
      hasVoiceMemo ? ` | [AUDIO VOICE MEMO ATTACHED (${recordingSeconds || 12}s)]` : ''
    }${photoPreview ? ` | [GROUND PHOTO ATTACHED (${photoName || 'field_capture.jpg'})]` : ''}`;

    updateMissionStatus(activeMission.id, newStatus, fullMessage);
    setSubmitted(true);

    setTimeout(() => {
      navigate('/officer');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center space-x-2">
            <Radio className="h-6 w-6 text-amber-600 animate-pulse" />
            <span>NDRF Ground Telemetry Log</span>
          </h1>
          <p className="text-xs text-slate-600 font-mono mt-0.5">
            Encrypted ground-to-control real-time satellite telemetry transmission
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 font-mono text-xs font-bold">
          FREQ: 142.85 MHz
        </span>
      </div>

      <Card variant="glass" className="p-6 space-y-5 border-slate-200 bg-white">
        {submitted ? (
          <div className="py-12 text-center space-y-4 font-mono">
            <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="font-bold text-xl text-slate-900 font-heading">
              Field Status Log Transmitted to Mission Control
            </h3>
            <p className="text-xs text-slate-600">
              Synchronized with State Emergency Command Dashboard. Returning to Field Overview...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            {/* Mission Selector */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Target Active Mission</label>
              <select
                value={selectedMissionId}
                onChange={(e) => setSelectedMissionId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold"
              >
                {missions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.teamName} ({m.assignedDistrict})
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Selector */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Current Rescue Progress Stage</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-amber-800 font-bold"
              >
                <option value="EN_ROUTE">EN_ROUTE (Navigating to inundated sector)</option>
                <option value="ON_SITE">ON_SITE (Arrived, deploying inflatable motorboats)</option>
                <option value="EVACUATING">EVACUATING (Transferring trapped residents from rooftops)</option>
                <option value="MISSION_COMPLETE">MISSION_COMPLETE (All citizens evacuated safely)</option>
              </select>
            </div>

            {/* Tactical Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center">
                  <Users className="h-3.5 w-3.5 text-blue-600 mr-1" /> Citizens Evacuated This Stage
                </label>
                <input
                  type="number"
                  min="0"
                  value={evacuatedCount}
                  onChange={(e) => setEvacuatedCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center">
                  <HeartPulse className="h-3.5 w-3.5 text-red-600 mr-1" /> Injured Treated / Hospitalized
                </label>
                <input
                  type="number"
                  min="0"
                  value={injuredCount}
                  onChange={(e) => setInjuredCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-red-600 font-bold"
                />
              </div>
            </div>

            {/* Hydrological Condition */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center">
                <Waves className="h-3.5 w-3.5 text-blue-600 mr-1" /> Water & Weather Hazard Status
              </label>
              <input
                type="text"
                value={waterCondition}
                onChange={(e) => setWaterCondition(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            {/* Detailed Notes */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Commander Field Observations & Telemetry
              </label>
              <textarea
                rows={4}
                required
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 leading-relaxed"
              />
            </div>

            {/* Media Attachments Section */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <label className="block text-slate-700 font-bold">
                Tactical Media Telemetry (Voice Memo & Ground Photo)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Voice Recording Control */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleToggleVoiceRecording}
                    className={`w-full p-3 rounded-lg border flex items-center justify-center space-x-2 transition-all font-bold ${
                      isRecordingVoice
                        ? 'bg-red-50 border-red-500 text-red-700 animate-pulse'
                        : hasVoiceMemo
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isRecordingVoice ? (
                      <>
                        <Square className="h-4 w-4 text-red-600 fill-red-600" />
                        <span>Stop Recording ({formatTime(recordingSeconds)})</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 text-amber-600" />
                        <span>
                          {hasVoiceMemo
                            ? `✓ Audio Recorded (${recordingSeconds || 12}s)`
                            : 'Record Voice Telemetry'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Audio Preview if Recorded */}
                  {hasVoiceMemo && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-emerald-800 text-[11px] font-bold">
                        <Volume2 className="h-4 w-4 text-emerald-600" />
                        <span>Voice Telemetry Saved ({recordingSeconds || 12}s)</span>
                      </div>
                      {audioUrl && (
                        <audio src={audioUrl} controls className="h-7 w-32" />
                      )}
                      <button
                        type="button"
                        onClick={clearVoiceMemo}
                        className="text-slate-500 hover:text-red-600 p-1"
                        title="Delete voice memo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Ground Photo Attachment Control */}
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className={`w-full p-3 rounded-lg border flex items-center justify-center space-x-2 transition-all font-bold ${
                      photoPreview
                        ? 'bg-blue-50 border-blue-400 text-blue-800'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Camera className="h-4 w-4 text-blue-600" />
                    <span>
                      {photoPreview ? '✓ Photo Attached (Click to Change)' : 'Attach / Take Ground Photo'}
                    </span>
                  </button>

                  {/* Photo Preview Thumbnail */}
                  {photoPreview && (
                    <div className="relative p-2 rounded-lg bg-blue-50 border border-blue-200 flex items-center space-x-3">
                      <img
                        src={photoPreview}
                        alt="Ground Telemetry Preview"
                        className="h-12 w-12 object-cover rounded-md border border-blue-300"
                      />
                      <div className="flex-1 truncate text-[11px]">
                        <p className="text-blue-800 font-bold truncate">{photoName || 'ground_photo.jpg'}</p>
                        <p className="text-slate-500 text-[10px]">Camera / Ground Capture Ready</p>
                      </div>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="p-1 text-slate-500 hover:text-red-600 rounded"
                        title="Remove photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
              <Button variant="ghost" type="button" onClick={() => navigate('/officer')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                <Send className="h-4 w-4 mr-1.5" />
                TRANSMIT TELEMETRY TO CONTROL ROOM
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

