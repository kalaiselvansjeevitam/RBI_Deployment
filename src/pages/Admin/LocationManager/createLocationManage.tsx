import Layout from "../../../app/components/Layout/Layout";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  useGetCreateLoactionManager,
  useGetDistrictParams,
} from "../../../app/core/api/Admin";
import type { District } from "../../../app/lib/types";
import { Button } from "../../../app/components/ui/button";

type LocationFormData = {
  district: string;
  block_panchayat: string;
  gram_panchayat: string;
  gram_panchayat_code: string;
};

const CreateLocationManage = () => {
  const { mutateAsync: createLocation } = useGetCreateLoactionManager();
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  const [districtList, setDistrictList] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<LocationFormData>({
    district: "",
    block_panchayat: "",
    gram_panchayat: "",
    gram_panchayat_code: "",
  });

  /* ---------------- Load Districts ---------------- */
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const res = await getDistricts();
        setDistrictList(res?.list ?? []);
      } catch (error) {
        Swal.fire("Error", "Failed to load districts", "error");
      }
    };

    loadDistricts();
  }, [getDistricts]);

  /* ---------------- Handle Input Change ---------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    const { district, block_panchayat, gram_panchayat } = formData;

    if (!district || !block_panchayat || !gram_panchayat) {
      Swal.fire("Validation Error", "All fields are required", "warning");
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
        district: "",
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

  return (
    <Layout headerTitle="Create Location">
      <div className="flex justify-center mt-10">
        <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-6 space-y-5">
          <h2 className="text-xl font-semibold text-center">Create Location</h2>

          {/* ---------------- District ---------------- */}
          <div>
            <label className="text-sm font-medium">
              District <span className="text-red-500">*</span>
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select District</option>
              {districtList.map((d) => (
                <option key={d.id} value={d.district}>
                  {d.district}
                </option>
              ))}
            </select>
          </div>

          {/* ---------------- Block Panchayat ---------------- */}
          <div>
            <label className="text-sm font-medium">
              Block Panchayat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="block_panchayat"
              value={formData.block_panchayat}
              onChange={handleChange}
              placeholder="Enter Block Panchayat"
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* ---------------- Gram Panchayat ---------------- */}
          <div>
            <label className="text-sm font-medium">
              Gram Panchayat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="gram_panchayat"
              value={formData.gram_panchayat}
              onChange={handleChange}
              placeholder="Enter Gram Panchayat"
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* ---------------- Gram Panchayat Code ---------------- */}
          <div>
            <label className="text-sm font-medium">
              Gram Panchayat Code (Optional)
            </label>
            <input
              type="text"
              name="gram_panchayat_code"
              value={formData.gram_panchayat_code}
              onChange={handleChange}
              placeholder="Enter Gram Panchayat Code"
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* ---------------- Submit Button ---------------- */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full text-white py-2 rounded-md disabled:opacity-50"
          >
            {loading ? "Saving..." : "Create Location"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateLocationManage;
