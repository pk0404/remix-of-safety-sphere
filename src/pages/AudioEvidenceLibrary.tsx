/**
 * Audio Evidence Library Page
 * ============================
 * Dedicated page for viewing, managing, and playing all recorded audio evidence.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  Trash2,
  Download,
  Mic,
  Calendar,
  MapPin,
  Clock,
  Search,
  Filter,
  FileAudio,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useEvidence } from '@/hooks/useEvidence';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import SlidingSidebar from '@/components/SlidingSidebar';
import OfflineIndicator from '@/components/OfflineIndicator';

const AudioEvidenceLibrary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { evidence, loading, deleteEvidence } = useEvidence();
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Filter for audio evidence only
  const audioEvidence = evidence.filter(
    (e) => e.media_type === 'audio' || e.file_url?.includes('.webm') || e.file_url?.includes('.mp3')
  );

  // Apply search filter
  const filteredEvidence = audioEvidence.filter((e) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      e.captured_at?.toLowerCase().includes(searchLower) ||
      formatDistanceToNow(new Date(e.captured_at)).toLowerCase().includes(searchLower)
    );
  });

  const handlePlay = (id: string, url: string) => {
    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (playingId === id) {
      setPlayingId(null);
      setAudioElement(null);
      return;
    }

    const audio = new Audio(url);
    audio.onended = () => {
      setPlayingId(null);
      setAudioElement(null);
    };
    audio.play();
    setPlayingId(id);
    setAudioElement(audio);
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SlidingSidebar />
        <div className="max-w-4xl mx-auto px-4 py-8 pt-16">
          <div className="text-center">
            <FileAudio className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Audio Evidence Library</h1>
            <p className="text-muted-foreground">Sign in to view your recorded evidence</p>
            <Button className="mt-4" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SlidingSidebar />

      <main className="max-w-4xl mx-auto px-4 py-4 pt-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audio Evidence Library</h1>
            <p className="text-muted-foreground text-sm">
              {filteredEvidence.length} recording{filteredEvidence.length !== 1 ? 's' : ''} stored
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search recordings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Recordings List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredEvidence.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Mic className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No recordings yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Audio recordings from SOS events and manual recordings will appear here
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-3">
              {filteredEvidence.map((record) => (
                <Card
                  key={record.id}
                  className={`transition-all ${
                    playingId === record.id ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Play Button */}
                      <Button
                        variant={playingId === record.id ? 'default' : 'outline'}
                        size="icon"
                        className="shrink-0 w-12 h-12 rounded-full"
                        onClick={() => handlePlay(record.id, record.file_url)}
                      >
                        {playingId === record.id ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </Button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant="secondary">
                            <Mic className="w-3 h-3 mr-1" />
                            Audio
                          </Badge>
                          {record.incident_id && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              SOS Recording
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {formatDistanceToNow(new Date(record.captured_at), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDuration(record.duration_seconds)}</span>
                          </div>
                          {(record.latitude && record.longitude) && (
                            <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">
                                {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">
                          Size: {formatFileSize(record.file_size)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDownload(
                              record.file_url,
                              `recording-${new Date(record.captured_at).toISOString()}.webm`
                            )
                          }
                        >
                          <Download className="w-4 h-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Recording?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The recording will be permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteEvidence(record.id, record.file_url)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>

      <OfflineIndicator />
    </div>
  );
};

export default AudioEvidenceLibrary;
