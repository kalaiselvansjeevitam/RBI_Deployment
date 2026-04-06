import { useEffect, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import {
  useGetBlockPanchayat,
  useGetCreateWorkshopParams,
  useGetGramPanchayat,
} from "../../../app/core/api/Admin";
import Swal from "sweetalert2";
import { Loader } from "lucide-react";
import type {
  BlockPanchayatRes,
  GramPanchayatRes,
} from "../../../app/lib/types";

const CreateWorkshop = () => {
  const { mutateAsync: CreateWorkshop } = useGetCreateWorkshopParams();
  const [formData, setFormData] = useState({
    workshop_name: "",
    date: "",
    from_time: "",
    to_time: "",
    vle_id: "",
    district: "",
    block_panchayat: "",
    gram_panchayat: "",
    gram_panchayat_code: "",
    location: "",
  });
  const DEFAULT_WORKSHOP_NAME =
    "Direct Contact Awareness Programs on Digital Payments";
  function reSetAll() {
    setFormData((prev) => ({
      ...prev,
      workshop_name: DEFAULT_WORKSHOP_NAME,
      date: "",
      from_time: "",
      to_time: "",
      vle_id: "",
      block_panchayat: "",
      gram_panchayat: "",
      gram_panchayat_code: "",
      location: "",
    }));
  }

  const { mutateAsync: getBlockPanchayat } = useGetBlockPanchayat();
  const { mutateAsync: getGramPanchayat } = useGetGramPanchayat();
  const [blockPanchayats, setBlockPanchayats] = useState<BlockPanchayatRes[]>(
    [],
  );
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayatRes[]>([]);
  const [loadingdist, setLoadingdist] = useState(false);
  const [loadingbp, setLoadingbp] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  // const [districts, setDistricts] = useState<District[]>([]);
  // const { mutateAsync: getDistricts } = useGetDistrictParams();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "workshop_name") {
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData((prev) => ({ ...prev, [name]: lettersOnly }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate());
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
  };

  const MAX_DATE = "2026-05-31";

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.workshop_name.trim())
      newErrors.workshop_name = "Workshop name is required";

    if (!formData.date) newErrors.date = "Date is required";

    if (!formData.from_time) newErrors.from_time = "From time is required";

    if (!formData.to_time) newErrors.to_time = "To time is required";
    if (!formData.location) newErrors.location = "Location is required";

    if (
      formData.from_time &&
      formData.to_time &&
      formData.from_time >= formData.to_time
    ) {
      newErrors.to_time = "To time must be after From time";
    }
    if (!formData.from_time) {
      newErrors.from_time = "From time is required";
    }

    if (!formData.to_time) {
      newErrors.to_time = "To time is required";
    }

    if (formData.from_time && formData.to_time) {
      const from = new Date(`1970-01-01T${formData.from_time}:00`);
      const to = new Date(`1970-01-01T${formData.to_time}:00`);

      const startLimit = new Date(`1970-01-01T09:00:00`);
      const endLimit = new Date(`1970-01-01T21:00:00`);

      const diffHours = (to.getTime() - from.getTime()) / (1000 * 60 * 60);

      if (from < startLimit || to > endLimit) {
        newErrors.to_time = "Workshop time must be between 9:00 AM and 9:00 PM";
      } else if (to <= from) {
        newErrors.to_time = "To time must be after From time";
      } else if (diffHours < 2) {
        newErrors.to_time = "Workshop duration must be at least 2 hours";
      }
    }
    // ✅ district (text only)
    if (!formData.district) newErrors.district = "district is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      // vle_id: Number(formData.vle_id), // backend expects number
    };

    console.log("Create Workshop Payload:", payload);

    // TODO: API call
    try {
      setLoading(true);
      const result = await CreateWorkshop(payload);
      console.log(result);
      setLoading(false);
      if (result?.result.toLowerCase() == "success") {
        reSetAll();
        Swal.fire("Success", result?.message, "success");
      } else {
        Swal.fire("Error", result?.message, "error");
      }
    } catch (error: any) {
      Swal.fire("Error", error?.response?.data?.message, "error");
      setLoading(false);
    }
  };
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      workshop_name: "Direct Contact Awareness Programs on Digital Payments",
    }));
  }, []);
  useEffect(() => {
    const storedDistrict = sessionStorage.getItem("district");

    if (!storedDistrict) return;

    setFormData((prev) => ({
      ...prev,
      district: storedDistrict,
    }));

    fetchBlockPanchayat(storedDistrict);
  }, []);

  const fetchBlockPanchayat = async (districtName: string) => {
    setLoadingdist(true);
    setBlockPanchayats([]);
    setGramPanchayats([]);

    try {
      const response = await getBlockPanchayat({
        district: districtName,
      });

      if (response?.result === "success") {
        setBlockPanchayats(response.list);
      }
    } catch (error) {
      console.error("Failed to fetch block panchayat", error);
    } finally {
      setLoadingdist(false);
    }
  };
  async function handleGramPanchayatChange(
    blockPanchayatName: string,
  ): Promise<void> {
    setLoadingbp(true);

    // set selected block panchayat in form
    setFormData((prev) => ({
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

  return (
    <Layout headerTitle="Create Work Shop">
      <div className="flex justify-center py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-white p-6 rounded-lg shadow space-y-6"
        >
          <h2 className="text-2xl text-center font-semibold text-gray-700">
            Workshop Details
          </h2>

          <div className="flex flex-col gap-4">
            {/* Workshop Name */}
            <div>
              <label className="text-sm font-medium">
                Workshop Name <span className="text-red-500">*</span>
              </label>
              <input
                name="workshop_name"
                value={formData.workshop_name}
                readOnly
                disabled
                className="w-full border rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
                placeholder="Enter Your Workshop Name"
              />
              {errors.workshop_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.workshop_name}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()} // ✅ future + 3 days
                max={MAX_DATE}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            {/* From Time */}
            <div>
              <label className="text-sm font-medium">
                From Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="from_time"
                value={formData.from_time}
                onChange={handleChange}
                min="09:00"
                max="19:00" // latest start allowed (so 2 hrs can fit before 9 PM)
                className="w-full border rounded-md px-3 py-2"
              />

              {errors.from_time && (
                <p className="text-xs text-red-500 mt-1">{errors.from_time}</p>
              )}
            </div>

            {/* To Time */}
            <div>
              <label className="text-sm font-medium">
                To Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="to_time"
                value={formData.to_time}
                onChange={handleChange}
                min="11:00" // earliest possible end time
                max="21:00"
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.to_time && (
                <p className="text-xs text-red-500 mt-1">{errors.to_time}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                District <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={formData.district}
                disabled
                className="w-full border rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
              />

              {errors.district && (
                <p className="text-xs text-red-500">{errors.district}</p>
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

                  setFormData((prev) => ({
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
                    {gp.gram_panchayat_name}
                  </option>
                ))}
              </select>
            </div>
            {/* Workshop Location */}
            <div>
              <label className="text-sm font-medium">
                Location (Center name and Center address){" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="location"
                value={formData.location}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter workshop location (Center name and Center address)"
              />
              {errors.location && (
                <p className="text-xs text-red-500 mt-1">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button type="submit" className="bg-purple" disabled={loading}>
              {loading ? (
                <div className=" flex justify-center">
                  <Loader className=" animate-spin" />
                </div>
              ) : (
                "Create Workshop"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateWorkshop;
