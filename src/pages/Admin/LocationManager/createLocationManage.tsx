import Layout from "../../../app/components/Layout/Layout";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  useGetCreateLoactionManager,
  useGetDistrictParams,
} from "../../../app/core/api/Admin";
import type { District } from "../../../app/lib/types";

export const CreateLocationManage = () => {
  const { mutateAsync: createLocation } = useGetCreateLoactionManager();
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  const [loading, setLoading] = useState(false);
  const [districtList, setDistrictList] = useState<District[]>([]);
  const [formData, setFormData] = useState({
    center_name: "",
    district: "",
    pincode: "",
    center_address: "",
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
    const { center_name, district, pincode, center_address } = formData;

    if (!center_name || !district || !pincode || !center_address) {
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
        center_name: "",
        district: "",
        pincode: "",
        center_address: "",
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
        <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-6 space-y-5 max-h-[80vh] overflow-y-auto scroll-smooth">
          <h2 className="text-xl font-semibold text-gray-700 text-center">
            Create Location<span className="text-red-500">*</span>
          </h2>

          {/* Center Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
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
            <label className="text-sm font-medium text-gray-700">
              Center Address<span className="text-red-500">*</span>
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
            <label className="text-sm font-medium text-gray-700">
              District<span className="text-red-500">*</span>
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full border rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select district</option>
              {districtList.map((d) => (
                <option key={d.id} value={d.district}>
                  {d.district}
                </option>
              ))}
            </select>
          </div>

          {/* Pincode */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Pincode<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setFormData({ ...formData, pincode: value });
              }}
              placeholder="Enter pincode"
              maxLength={6}
              inputMode="numeric"
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
