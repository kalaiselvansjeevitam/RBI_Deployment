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
  BlockPanchayatRes,
  District,
  GetDistrictListRes,
  GramPanchayatRes,
} from "../../../app/lib/types";
import {
  useGetBlockPanchayat,
  useGetDistrictParams,
  useGetGramPanchayat,
  useGetUpdateUser,
} from "../../../app/core/api/Admin";
import { Button } from "../../../app/components/ui/button";
import { Loader } from "lucide-react";

type Props = {
  open: boolean;
  user: AllUser | null;
  onClose: (updated?: boolean) => void;
};

const UserEditSheet = ({ open, user, onClose }: Props) => {
  const { mutateAsync: updateUser } = useGetUpdateUser();
  const [districts, setDistricts] = useState<District[]>([]);
  const { mutateAsync: getBlockPanchayat } = useGetBlockPanchayat();
  const { mutateAsync: getGramPanchayat } = useGetGramPanchayat();
  const [blockPanchayats, setBlockPanchayats] = useState<BlockPanchayatRes[]>(
    [],
  );
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayatRes[]>([]);
  const [loadingdist, setLoadingdist] = useState(false);
  const [loadingbp, setLoadingbp] = useState(false);
  const [formData, setForm] = useState({
    name: "",
    block_panchayat: "",
    gram_panchayat: "",
    gram_panchayat_code: "",
    district_name: "",
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
        name: user.name || "",
        block_panchayat: user.block_panchayat || "",
        gram_panchayat: user.gram_panchayat || "",
        gram_panchayat_code: user.gram_panchayat_code || "",
        district_name: user.district_name || "",
        salutations: user.salutations || "",
        change_user_id: user.unique_user_id || "",
      });
    }
  }, [user]);

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    try {
      const response = await updateUser(formData);

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
  async function handleLocationChange(districtName: string): Promise<void> {
    setLoadingdist(true);
    // set district in form
    setForm((prev) => ({
      ...prev,
      district: districtName,
      block_panchayat: "", // reset dependent field
      gram_panchayat: "",
      gram_panchayat_code: "",
    }));

    if (!districtName) {
      setBlockPanchayats([]);
      setLoadingdist(false);
      return;
    }

    try {
      const response = await getBlockPanchayat({
        district: districtName, // 👈 passing district name
      });

      if (response?.result === "success") {
        setBlockPanchayats(response.list);
      } else {
        setBlockPanchayats([]);
      }
    } catch (error) {
      console.error("Failed to fetch block panchayat", error);
      setBlockPanchayats([]);
    } finally {
      setLoadingdist(false);
    }
  }
  async function handleGramPanchayatChange(
    blockPanchayatName: string,
  ): Promise<void> {
    setLoadingbp(true);

    // set selected block panchayat in form
    setForm((prev) => ({
      ...prev,
      block_panchayat: blockPanchayatName,
      gram_panchayat: "", // reset dependent field
    }));

    if (!blockPanchayatName) {
      setGramPanchayats([]);
      setLoadingbp(false);
      return;
    }

    try {
      const response = await getGramPanchayat({
        block_panchayat_name: blockPanchayatName,
      });

      if (response?.result === "success") {
        setGramPanchayats(response.list);
      } else {
        setGramPanchayats([]);
      }
    } catch (error) {
      console.error("Failed to fetch gram panchayat", error);
      setGramPanchayats([]);
    } finally {
      setLoadingbp(false);
    }
  }
  useEffect(() => {
    if (!user?.district_name) return;

    (async () => {
      setLoadingdist(true);
      try {
        const res = await getBlockPanchayat({
          district: user.district_name,
        });

        if (res?.result === "success") {
          setBlockPanchayats(res.list);
        }
      } finally {
        setLoadingdist(false);
      }
    })();
  }, [user?.district_name]);
  useEffect(() => {
    if (!user?.block_panchayat) return;

    (async () => {
      setLoadingbp(true);
      try {
        const res = await getGramPanchayat({
          block_panchayat_name: user.block_panchayat,
        });

        if (res?.result === "success") {
          setGramPanchayats(res.list);
        }
      } finally {
        setLoadingbp(false);
      }
    })();
  }, [user?.block_panchayat]);

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
            <label className="text-sm font-medium">
              Name<span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setForm({ ...formData, name: e.target.value })}
            />
          </div>
          {/* Salutation */}
          <div>
            <label className="text-sm font-medium">
              Salutation<span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 bg-white"
              value={formData.salutations}
              onChange={(e) =>
                setForm({ ...formData, salutations: e.target.value })
              }
            >
              <option value="">Select Salutation</option>
              <option value="mr">Mr</option>
              <option value="mrs">Mrs</option>
              <option value="ms">Ms</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">
              District <span className="text-red-500">*</span>
            </label>

            <select
              name="district"
              value={formData.district_name}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.district}>
                  {d.district}
                </option>
              ))}
            </select>
            {loadingdist && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <Loader className="w-4 h-4 animate-spin" />
                Fetching data...
              </div>
            )}
          </div>

          {/* Sub District */}
          <div>
            <label className="text-sm font-medium">
              Block Panchayat <span className="text-red-500">*</span>
            </label>

            <select
              name="block_panchayat"
              value={formData.block_panchayat}
              onChange={(e) => handleGramPanchayatChange(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              disabled={!blockPanchayats.length}
            >
              <option value="">Select Block Panchayat</option>

              {blockPanchayats.map((bp) => (
                <option
                  key={bp.block_panchayat_name}
                  value={bp.block_panchayat_name}
                >
                  {bp.block_panchayat_name}
                </option>
              ))}
            </select>
            {loadingbp && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <Loader className="w-4 h-4 animate-spin" />
                Fetching data...
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">
              Gram Panchayat <span className="text-red-500">*</span>
            </label>

            <select
              name="gram_panchayat"
              value={formData.gram_panchayat}
              onChange={(e) => {
                const selectedGP = gramPanchayats.find(
                  (gp) => gp.gram_panchayat_name === e.target.value,
                );

                setForm((prev) => ({
                  ...prev,
                  gram_panchayat: selectedGP?.gram_panchayat_name || "",
                  gram_panchayat_code: selectedGP?.gram_panchayat_code || "",
                }));
              }}
              className="w-full border rounded-md px-3 py-2"
              disabled={!gramPanchayats.length || loadingdist}
            >
              <option value="">
                {loadingdist ? "Loading..." : "Select Gram Panchayat"}
              </option>

              {gramPanchayats.map((gp) => (
                <option
                  key={gp.gram_panchayat_name}
                  value={gp.gram_panchayat_name}
                >
                  {gp.gram_panchayat_code} - {gp.gram_panchayat_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location (2 column) */}

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-white sticky bottom-0">
          <Button
            onClick={handleSubmit}
            className="w-full text-white py-2.5 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Update User
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserEditSheet;
