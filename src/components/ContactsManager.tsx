import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { UserPlus, Trash2, Phone, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface ContactsManagerProps {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
}

const ContactsManager = ({ contacts, setContacts }: ContactsManagerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [contacts.length]);

  const addContact = () => {
    if (!name || !phone || !relationship) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      phone,
      relationship,
    };

    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);
    localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));

    setName('');
    setPhone('');
    setRelationship('');
    setIsOpen(false);

    toast({
      title: "Contact Added",
      description: `${name} has been added to your emergency contacts.`,
    });
  };

  const removeContact = (id: string) => {
    const updatedContacts = contacts.filter(c => c.id !== id);
    setContacts(updatedContacts);
    localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));

    toast({
      title: "Contact Removed",
      description: "Emergency contact has been removed.",
    });
  };

  const getRelationshipIcon = (rel: string) => {
    switch (rel) {
      case 'parent':
        return <Heart className="w-4 h-4 text-primary" />;
      case 'friend':
        return <User className="w-4 h-4 text-success" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Emergency Contacts</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-primary text-primary-foreground">
              <UserPlus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Emergency Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contact name"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Relationship</label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addContact} className="w-full gradient-primary text-primary-foreground">
                Add Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div ref={containerRef} className="space-y-2">
        {contacts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No emergency contacts added</p>
            <p className="text-xs">Add contacts who will be notified</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 bg-card rounded-xl border border-border shadow-card"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded-full bg-accent flex items-center justify-center">
                  {getRelationshipIcon(contact.relationship)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{contact.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{contact.relationship}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${contact.phone}`}
                  className="p-2 rounded-full bg-success/10 text-success hover:bg-success/20 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  onClick={() => removeContact(contact.id)}
                  className="p-2 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactsManager;
