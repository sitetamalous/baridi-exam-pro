
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UpdateNameDialogProps {
  open: boolean;
  onClose: () => void;
  currentName: string;
  onSuccess: (newName: string) => void;
}

const UpdateNameDialog: React.FC<UpdateNameDialogProps> = ({
  open, onClose, currentName, onSuccess
}) => {
  const [name, setName] = useState(currentName || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("users").update({ full_name: name }).eq("id", (window as any).currentUserId);
    setLoading(false);

    if (error) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء تحديث الاسم.", variant: "destructive" });
    } else {
      toast({ title: "تم التحديث", description: "تم تحديث الاسم بنجاح." });
      onSuccess(name);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل الاسم</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="الاسم"
            maxLength={50}
            autoFocus
            className="text-right"
          />
          <Button type="submit" disabled={loading || !name} className="mt-2">
            {loading ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateNameDialog;
