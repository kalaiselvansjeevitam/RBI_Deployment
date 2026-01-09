import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../app/components/ui/sheet";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useChangeUserPassword } from "../../../app/core/api/Admin";
import type { AllUser } from "../../../app/lib/types";

type Props = {
  open: boolean;
  user: AllUser | null;
  onClose: (updated?: boolean) => void;
};

const ChangePasswordSheet = ({ open, user, onClose }: Props) => {
  const { mutateAsync: changePassword } = useChangeUserPassword();

  const [form, setForm] = useState({
    unique_user_id: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ---------- PREFILL ---------- */
  useEffect(() => {
    if (user) {
      setForm({
        unique_user_id: user.unique_user_id,
        new_password: "",
        confirm_password: "",
      });
    }
  }, [user]);

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    if (!form.new_password || !form.confirm_password) {
      Swal.fire({
        title: "Error",
        text: "Please fill all fields",
        icon: "error",
        timer: 1000,
        allowOutsideClick: false,
        showConfirmButton: false,
      });
      return;
    }

    if (form.new_password !== form.confirm_password) {
      Swal.fire({
        title: "Error",
        text: "Passwords do not match",
        icon: "error",
        timer: 1000,
        allowOutsideClick: false,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setLoading(true);

      const response = await changePassword({
        change_user_id: form.unique_user_id,
        new_password: form.new_password,
      });

      Swal.fire({
        title: "Success",
        text: response.message || "Password updated successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      onClose(true);
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error?.response.data.message || "Password Update Failed",
        icon: "error",
        timer: 1500,
        allowOutsideClick: false,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[420px] px-6 py-6">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold text-gray-800">
            Change Password
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5 text-sm">
          {/* NEW PASSWORD */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={form.new_password}
                onChange={(e) =>
                  setForm({ ...form, new_password: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirm_password}
                onChange={(e) =>
                  setForm({ ...form, confirm_password: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 rounded-md py-2.5 font-semibold text-white transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }
            `}
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChangePasswordSheet;
