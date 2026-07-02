import { UserPlus, Pencil, Trash2, Phone, Users } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TrustedContact } from '@/lib/types';

interface TrustedContactsPanelProps {
  contacts: TrustedContact[];
  onAdd: () => void;
  onEdit: (contact: TrustedContact) => void;
  onDelete: (id: string) => void;
}

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500',
];

const TrustedContactsPanel = ({ contacts, onAdd, onEdit, onDelete }: TrustedContactsPanelProps) => {
  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Users size={20} className="text-gray-300" />
          </div>
          <p className="text-sm font-bold text-gray-900">No trusted contacts added yet</p>
          <p className="text-xs font-medium text-gray-400 mt-1 mb-4">
            Add contacts to share your journey status
          </p>
          <Button onClick={onAdd} className="bg-[#1b3a2a] hover:bg-[#1b3a2a]/90 text-white">
            <UserPlus size={14} className="mr-1.5" />
            Add Contact
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">
          Trusted Contacts ({contacts.length})
        </h3>
        <Button onClick={onAdd} size="sm" className="bg-[#1b3a2a] hover:bg-[#1b3a2a]/90 text-white h-8">
          <UserPlus size={13} className="mr-1" />
          Add
        </Button>
      </div>

      <div className="divide-y divide-gray-100">
        {contacts.map((contact, index) => (
          <div key={contact.id} className="p-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0',
                  avatarColors[index % avatarColors.length],
                )}
              >
                {contact.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{contact.name}</h4>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => onEdit(contact)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Pencil size={12} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => onDelete(contact.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <Phone size={10} className="text-gray-300" />
                  <span className="text-[11px] font-medium text-gray-500">{contact.phone}</span>
                  {contact.relationship && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-[11px] font-medium text-gray-400">{contact.relationship}</span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Switch
                      checked={contact.notifyOnStart}
                      onCheckedChange={() => onEdit({ ...contact, notifyOnStart: !contact.notifyOnStart })}
                      className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
                    />
                    <span className="text-[10px] font-medium text-gray-400">Notify Start</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Switch
                      checked={contact.notifyOnArrival}
                      onCheckedChange={() => onEdit({ ...contact, notifyOnArrival: !contact.notifyOnArrival })}
                      className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
                    />
                    <span className="text-[10px] font-medium text-gray-400">Notify Arrival</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Switch
                      checked={contact.shareLiveLocation}
                      onCheckedChange={() => onEdit({ ...contact, shareLiveLocation: !contact.shareLiveLocation })}
                      className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
                    />
                    <span className="text-[10px] font-medium text-gray-400">Live Location</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustedContactsPanel;
