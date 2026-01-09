import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../app/components/ui/dialog";
// import { Loader2 } from 'lucide-react';

type StatusModalProps = {
  open: boolean;
  onClose: () => void;
  data: any;
};

const StatusModal = ({ open, onClose, data }: StatusModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto text-center p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {data?.status}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 text-gray-500">
          {/* Your future content goes here */}
          This data is {data?.status}.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusModal;
