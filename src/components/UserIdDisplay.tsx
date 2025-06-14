
import React from 'react';
import { Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const UserIdDisplay: React.FC<{ id: string }> = ({ id }) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(id);
    toast({ title: "تم النسخ", description: "تم نسخ معرف المستخدم.", duration: 2000 });
  };

  return (
    <div className="flex items-center gap-2 mt-2 justify-center">
      <span className="font-mono text-xs bg-gray-100 rounded px-2 py-1">{id}</span>
      <Button size="icon" className="bg-algeria-green hover:bg-green-700 text-white" onClick={handleCopy}>
        <Clipboard size={16} />
      </Button>
    </div>
  );
};
export default UserIdDisplay;
