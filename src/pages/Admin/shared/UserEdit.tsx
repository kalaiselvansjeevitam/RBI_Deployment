import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../app/components/ui/sheet";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import type {
  AllUser,
  District,
  GetDistrictListRes,
} from "../../../app/lib/types";
import {
  useGetDistrictParams,
  useGetUpdateUser,
} from "../../../app/core/api/Admin";

type Props = {
  open: boolean;
  user: AllUser | null;
  onClose: (updated?: boolean) => void;
};

const UserEditSheet = ({ open, user, onClose }: Props) => {
  const { mutateAsync: updateUser } = useGetUpdateUser();
  const [districts, setDistricts] = useState<District[]>([]);

  const [form, setForm] = useState({
    username: "",
    address: "",
    sub_district_name: "",
    district_name: "",
    state: "",
    pincode: "",
    specilization: "",
    degree: "",
    salutations: "",
    change_user_id: "",
  });
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res: GetDistrictListRes = await getDistricts();
        if (res?.result === "success") {
          setDistricts(res.list);
        }
      } catch (error) {
        console.error("Failed to fetch districts", error);
      }
    };

    fetchDistricts();
  }, [getDistricts]);

  /* ---------- PREFILL FORM ---------- */
  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        address: user.address || "",
        sub_district_name: user.sub_district_name || "",
        district_name: user.district_name || "",
        state: user.state || "",
        pincode: user.pincode || "",
        specilization: user.specilization || "",
        degree: user.degree || "",
        salutations: user.salutations || "",
        change_user_id: user.unique_user_id || "",
      });
    }
  }, [user]);

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    try {
      const response = await updateUser(form);

      Swal.fire({
        title: "Success",
        text: response.message,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      onClose(true);
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error?.response.data.message || "Checklist update failed",
        icon: "error",
        timer: 1500,
        allowOutsideClick: false,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[460px] p-0 overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-lg font-semibold">
            Edit User Details
          </SheetTitle>
        </SheetHeader>

        {/* Body */}
        <div className="px-6 py-4 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] text-sm">
          {/* Username */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Username
            </label>
            <input
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Address
            </label>
            <textarea
              rows={3}
              className="w-full border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          {/* Location (2 column) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                District
              </label>

              <select
                className="w-full border rounded-md px-3 py-2 bg-white"
                value={form.district_name} // 👈 keeps existing value selected
                onChange={(e) =>
                  setForm({ ...form, district_name: e.target.value })
                }
              >
                <option value="">Select District</option>

                {districts.map((d) => (
                  <option key={d.id} value={d.district}>
                    {d.district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Sub District
              </label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={form.sub_district_name}
                onChange={(e) =>
                  setForm({ ...form, sub_district_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />
          </div>

          {/* Education */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={form.specilization}
                onChange={(e) =>
                  setForm({ ...form, specilization: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Degree
              </label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
              />
            </div>
          </div>

          {/* Salutation */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Salutation
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 bg-white"
              value={form.salutations}
              onChange={(e) =>
                setForm({ ...form, salutations: e.target.value })
              }
            >
              <option value="">Select Salutation</option>
              <option value="mr">Mr</option>
              <option value="mrs">Mrs</option>
              <option value="ms">Ms</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-white sticky bottom-0">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Update User
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserEditSheet;
