import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
  Phone,
  Shield,
  Heart,
  AlertTriangle,
  Flame,
  Baby,
  Car,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EmergencyNumber {
  name: string;
  number: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  category: 'primary' | 'women' | 'medical' | 'other';
}

const emergencyNumbers: EmergencyNumber[] = [
  // Primary Emergency
  {
    name: 'Police',
    number: '100',
    description: 'For any crime or law enforcement',
    icon: Shield,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    category: 'primary',
  },
  {
    name: 'Emergency Services',
    number: '112',
    description: 'Universal emergency number',
    icon: Phone,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    category: 'primary',
  },
  {
    name: 'Ambulance',
    number: '108',
    description: 'Medical emergency & ambulance',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    category: 'primary',
  },
  {
    name: 'Fire Brigade',
    number: '101',
    description: 'Fire emergencies',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    category: 'primary',
  },

  // Women Safety
  {
    name: 'Women Helpline',
    number: '1091',
    description: 'Women in distress',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    category: 'women',
  },
  {
    name: 'National Commission for Women',
    number: '7827-170-170',
    description: 'NCW WhatsApp helpline',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    category: 'women',
  },
  {
    name: 'Domestic Violence',
    number: '181',
    description: 'Women domestic abuse helpline',
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    category: 'women',
  },
  {
    name: 'Anti-Stalking',
    number: '1096',
    description: 'Report stalking & harassment',
    icon: Shield,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    category: 'women',
  },

  // Medical
  {
    name: 'AIIMS Emergency',
    number: '1800-599-0019',
    description: 'AIIMS medical consultation',
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    category: 'medical',
  },
  {
    name: 'Mental Health',
    number: '1800-599-0019',
    description: 'Mental health helpline',
    icon: Heart,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    category: 'medical',
  },

  // Other
  {
    name: 'Child Helpline',
    number: '1098',
    description: 'Child in need of care',
    icon: Baby,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    category: 'other',
  },
  {
    name: 'Road Accident',
    number: '1073',
    description: 'Road accident emergency',
    icon: Car,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    category: 'other',
  },
];

const EmergencyNumbers = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, []);

  const categories = [
    { id: 'all', label: 'All', count: emergencyNumbers.length },
    { id: 'primary', label: 'Emergency', count: emergencyNumbers.filter((n) => n.category === 'primary').length },
    { id: 'women', label: 'Women Safety', count: emergencyNumbers.filter((n) => n.category === 'women').length },
    { id: 'medical', label: 'Medical', count: emergencyNumbers.filter((n) => n.category === 'medical').length },
    { id: 'other', label: 'Other', count: emergencyNumbers.filter((n) => n.category === 'other').length },
  ];

  const filteredNumbers =
    selectedCategory === 'all'
      ? emergencyNumbers
      : emergencyNumbers.filter((n) => n.category === selectedCategory);

  const displayNumbers = expanded ? filteredNumbers : filteredNumbers.slice(0, 4);

  const callNumber = (number: string) => {
    window.open(`tel:${number.replace(/-/g, '')}`, '_self');
  };

  return (
    <Card ref={containerRef} className="border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-destructive" />
          Emergency Numbers
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Category Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label} ({cat.count})
            </Badge>
          ))}
        </div>

        {/* Numbers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayNumbers.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.number}
                className={`p-3 rounded-xl ${item.bgColor} border border-transparent hover:border-border transition-colors cursor-pointer group`}
                onClick={() => callNumber(item.number)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground text-sm truncate">{item.name}</h4>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className={`text-lg font-bold ${item.color}`}>{item.number}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expand/Collapse */}
        {filteredNumbers.length > 4 && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show All ({filteredNumbers.length})
              </>
            )}
          </Button>
        )}

        {/* Quick Dial Buttons */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Quick Dial</p>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => callNumber('112')}
              className="gap-2"
            >
              <Phone className="w-4 h-4" />
              112 Emergency
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => callNumber('1091')}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              1091 Women
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => callNumber('100')}
              className="gap-2"
            >
              <Shield className="w-4 h-4" />
              100 Police
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyNumbers;
