import { useState, useEffect } from 'react';
import {
  Mic,
  Play,
  Pause,
  Trash2,
  Download,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Folder,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AudioEvidence {
  id: string;
  file_url: string;
  captured_at: string;
  latitude: number | null;
  longitude: number | null;
  duration_seconds: number | null;
  file_size: number | null;
}

const AudioEvidenceViewer = () => {
  const { user } = useAuth();
  const [evidence, setEvidence] = useState<AudioEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (user) {
      fetchEvidence();
    }
  }, [user]);

  const fetchEvidence = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('evidence')
        .select('*')
        .eq('user_id', user.id)
        .eq('media_type', 'audio')
        .order('captured_at', { ascending: false });

      if (error) throw error;
      setEvidence(data || []);
    } catch (error) {
      console.error('Error fetching audio evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (item: AudioEvidence) => {
    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }

    if (playingId === item.id) {
      setPlayingId(null);
      return;
    }

    try {
      // Get signed URL for the file
      const { data, error } = await supabase.storage
        .from('evidence')
        .createSignedUrl(item.file_url.replace('evidence/', ''), 3600);

      if (error) throw error;

      const audio = new Audio(data.signedUrl);
      audio.onended = () => setPlayingId(null);
      audio.play();
      setAudioElement(audio);
      setPlayingId(item.id);
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play audio');
    }
  };

  const deleteEvidence = async (id: string, fileUrl: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('evidence')
        .remove([fileUrl.replace('evidence/', '')]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('evidence')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      setEvidence(prev => prev.filter(e => e.id !== id));
      toast.success('Audio evidence deleted');
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast.error('Failed to delete evidence');
    }
  };

  const downloadEvidence = async (item: AudioEvidence) => {
    try {
      const { data, error } = await supabase.storage
        .from('evidence')
        .createSignedUrl(item.file_url.replace('evidence/', ''), 3600);

      if (error) throw error;

      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `evidence_${format(new Date(item.captured_at), 'yyyy-MM-dd_HH-mm')}.webm`;
      link.click();
    } catch (error) {
      console.error('Error downloading evidence:', error);
      toast.error('Failed to download evidence');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!user) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border shadow-card">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Folder className="w-5 h-5 text-primary" />
                Recorded Audio Evidence
                <Badge variant="secondary" className="ml-2">
                  {evidence.length}
                </Badge>
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
              </div>
            ) : evidence.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Mic className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No audio recordings yet</p>
                <p className="text-xs">Recorded audio will appear here</p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {evidence.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-muted/50 rounded-lg flex items-center gap-3"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => playAudio(item)}
                      >
                        {playingId === item.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {format(new Date(item.captured_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatFileSize(item.file_size)}
                          </span>
                          {item.latitude && item.longitude && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Location saved
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => downloadEvidence(item)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteEvidence(item.id, item.file_url)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default AudioEvidenceViewer;
