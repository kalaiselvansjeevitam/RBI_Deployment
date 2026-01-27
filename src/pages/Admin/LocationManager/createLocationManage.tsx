import Layout from "../../../app/components/Layout/Layout";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  useGetBlockPanchayat,
  useGetCreateLoactionManager,
  useGetDistrictParams,
  useGetGramPanchayat,
} from "../../../app/core/api/Admin";
import type {
  BlockPanchayatRes,
  District,
  GramPanchayatRes,
} from "../../../app/lib/types";
import { Loader } from "lucide-react";

export const CreateLocationManage = () => {
  const { mutateAsync: createLocation } = useGetCreateLoactionManager();
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: getBlockPanchayat } = useGetBlockPanchayat();
  const { mutateAsync: getGramPanchayat } = useGetGramPanchayat();
  const [blockPanchayats, setBlockPanchayats] = useState<BlockPanchayatRes[]>(
    [],
  );
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayatRes[]>([]);
  const [loadingdist, setLoadingdist] = useState(false);
  const [loadingbp, setLoadingbp] = useState(false);

  const [loading, setLoading] = useState(false);
  const [districtList, setDistrictList] = useState<District[]>([]);
  const [formData, setFormData] = useState({
    center_name: "",
    district: "",
    center_address: "",
    block_panchayat: "",
    gram_panchayat: "",
    gram_panchayat_code: "",
  });

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const res = await getDistricts();
        setDistrictList(res?.list ?? []);
      } catch {
        Swal.fire("Error", "Failed to load districts", "error");
      }
    };

    loadDistricts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { center_name, district, gram_panchayat, block_panchayat } = formData;

    if (!center_name || !district || !gram_panchayat || !block_panchayat) {
      Swal.fire(
        "Validation Error",
        "Except Center Address All fields are required",
        "warning",
      );
      return;
    }

    try {
      setLoading(true);
      const res = await createLocation(formData);

      Swal.fire(
        "Success",
        res?.message || "Location created successfully",
        "success",
      );

      setFormData({
        center_name: "",
        district: "",
        center_address: "",
        block_panchayat: "",
        gram_panchayat: "",
        gram_panchayat_code: "",
      });
    } catch (error: any) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to create location",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  async function handleLocationChange(districtName: string): Promise<void> {
    setLoadingdist(true);
    // set district in form
    setFormData((prev) => ({
      ...prev,
      district: districtName,
      block_panchayat: "", // reset dependent field
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
    <Layout headerTitle="Create Location">
      <div className="flex justify-center mt-10">
        <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-6 space-y-5 max-h-[80vh] overflow-y-auto scroll-smooth">
          <h2 className="text-xl font-semibold text-center">Create Location</h2>

          {/* Center Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Center Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="center_name"
              value={formData.center_name}
              onChange={handleChange}
              placeholder="Enter center name"
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Center Address<span className="text-gray-700"> (optional)</span>
            </label>
            <textarea
              name="center_address"
              value={formData.center_address}
              onChange={handleChange}
              placeholder="Enter center address"
              rows={3}
              className="w-full border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* District */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              District<span className="text-red-500">*</span>
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full border rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select district</option>
              {districtList.map((d) => (
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

          {/* Pincode */}

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
                  {gp.gram_panchayat_code} - {gp.gram_panchayat_name}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Create Location"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateLocationManage;
