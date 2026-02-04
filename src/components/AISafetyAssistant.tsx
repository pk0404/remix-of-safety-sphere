import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Bot, Send, Loader2, Sparkles, MapPin, Shield, AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Location {
  latitude: number;
  longitude: number;
  altitude: number | null;
}

interface AISafetyAssistantProps {
  location: Location | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SafetyAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  safetyTips: string[];
  nearbyResources: string[];
}

const AISafetyAssistant = ({ location }: AISafetyAssistantProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [safetyAnalysis, setSafetyAnalysis] = useState<SafetyAnalysis | null>(null);
  const [analyzingLocation, setAnalyzingLocation] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const analyzeLocation = useCallback(async () => {
    if (!location) {
      toast.error('Location not available');
      return;
    }

    if (!user) {
      toast.error('Please sign in to use AI features');
      return;
    }

    setAnalyzingLocation(true);
    try {
      // Force refresh the session to get a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError) {
        // Try getSession as fallback
        const { data: fallbackData, error: fallbackError } = await supabase.auth.getSession();
        if (fallbackError || !fallbackData.session) {
          toast.error('Session expired. Please sign in again.');
          return;
        }
      }
      
      if (!session) {
        toast.error('Please sign in to use AI features');
        return;
      }

      const { data, error } = await supabase.functions.invoke('safety-analysis', {
        body: {
          type: 'analyze_location',
          data: {
            latitude: location.latitude,
            longitude: location.longitude,
          }
        }
      });

      if (error) throw error;

      // Parse the AI response
      const content = data.result;
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setSafetyAnalysis({
            riskLevel: parsed.riskLevel || 'low',
            safetyTips: parsed.safetyTips || [],
            nearbyResources: parsed.nearbyResources || [],
          });
        } else {
          // Fallback: Create analysis from text
          setSafetyAnalysis({
            riskLevel: 'low',
            safetyTips: ['Stay aware of your surroundings', 'Keep your phone charged', 'Share your location with trusted contacts'],
            nearbyResources: ['Local police station', 'Nearby hospital', 'Public places'],
          });
        }
      } catch {
        setSafetyAnalysis({
          riskLevel: 'low',
          safetyTips: ['Stay aware of your surroundings', 'Keep your phone charged', 'Share your location with trusted contacts'],
          nearbyResources: ['Local police station', 'Nearby hospital', 'Public places'],
        });
      }

      toast.success('Location analyzed');
    } catch (error) {
      console.error('Error analyzing location:', error);
      toast.error('Failed to analyze location. Please try again.');
    } finally {
      setAnalyzingLocation(false);
    }
  }, [location, user]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!user) {
      toast.error('Please sign in to chat with the AI assistant');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Force refresh the session to ensure valid token
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError) {
        // Try getSession as fallback
        const { data: fallbackData, error: fallbackError } = await supabase.auth.getSession();
        if (fallbackError || !fallbackData.session) {
          toast.error('Session expired. Please sign in again.');
          setLoading(false);
          return;
        }
      }
      
      if (!session) {
        toast.error('Please sign in to use AI features');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('safety-analysis', {
        body: {
          type: 'safety_tips',
          data: {
            context: input.trim(),
            location: location ? `${location.latitude}, ${location.longitude}` : 'unknown',
          }
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.result || 'I apologize, I couldn\'t process that. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Walking alone at night', icon: MapPin },
    { label: 'Public transport safety', icon: Shield },
    { label: 'Suspicious person following', icon: AlertTriangle },
  ];

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div ref={containerRef} className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">AI Safety Assistant</h2>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
        <Card className="p-6 text-center">
          <Bot className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Sign in to use the AI Safety Assistant</p>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">AI Safety Assistant</h2>
        <Badge variant="secondary" className="text-xs">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Location Analysis Card */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Location Safety Analysis</span>
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeLocation}
            disabled={!location || analyzingLocation}
          >
            {analyzingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        {safetyAnalysis ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Risk Level:</span>
              <Badge className={getRiskBadgeColor(safetyAnalysis.riskLevel)}>
                {safetyAnalysis.riskLevel.toUpperCase()}
              </Badge>
            </div>
            
            {safetyAnalysis.safetyTips.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Safety Tips:</p>
                <ul className="space-y-1">
                  {safetyAnalysis.safetyTips.slice(0, 3).map((tip, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1">
                      <span className="text-primary">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {location ? 'Tap refresh to analyze your location safety' : 'Enable location to get safety analysis'}
          </p>
        )}
      </Card>

      {/* Chat Interface */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Ask Safety Questions</span>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-3">
          {quickActions.map((action, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                setInput(action.label);
              }}
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <ScrollArea className="h-48 mb-3 rounded-lg border p-3">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about safety tips..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AISafetyAssistant;
