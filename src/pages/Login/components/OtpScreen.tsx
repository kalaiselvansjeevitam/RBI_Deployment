import { Button } from "../../../app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../app/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../../../app/components/ui/input-otp";
import { ROUTE_URL } from "../../../app/core/constants/coreUrl";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useNavigate } from "react-router-dom";

export function OtpScreen({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: () => void;
}) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] h-[300px]">
        <DialogHeader>
          <DialogTitle>Enter OTP</DialogTitle>
          <DialogDescription>
            OTP has been sent to your resgistered mobile number/email
          </DialogDescription>
        </DialogHeader>
        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
          <InputOTPGroup className=" flex justify-evenly items-center w-[100%]">
            <InputOTPSlot
              index={0}
              style={{ borderRadius: "0px" }}
              className="  border border-black w-12 h-12"
            />
            <InputOTPSlot
              index={1}
              className="  border border-black w-12 h-12"
            />
            <InputOTPSlot
              index={2}
              className="  border border-black w-12 h-12"
            />
            <InputOTPSlot
              index={3}
              className="  border border-black w-12 h-12"
            />
            <InputOTPSlot
              index={4}
              className="  border border-black w-12 h-12"
            />
            <InputOTPSlot
              index={5}
              style={{ borderRadius: "0px" }}
              className="  border border-black w-12 h-12"
            />
          </InputOTPGroup>
        </InputOTP>
        <DialogFooter>
          <Button
            onClick={() => navigate(ROUTE_URL.dashboard)}
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
