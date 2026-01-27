import { useEffect, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import {
  useGetCreateWorkshopParams,
  useGetDistrictByLocation,
  // useGetDistrictParams,
  useGetLocationManagerParams,
} from "../../../app/core/api/Admin";
import Swal from "sweetalert2";
import { Loader } from "lucide-react";
import type {
  // District,
  // GetDistrictListRes,
  LocationType,
} from "../../../app/lib/types";

const CreateWorkshop = () => {
  const { mutateAsync: CreateWorkshop } = useGetCreateWorkshopParams();
  const { mutateAsync: GetLocation } = useGetLocationManagerParams();
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [formData, setFormData] = useState({
    workshop_name: "",
    date: "",
    from_time: "",
    to_time: "",
    vle_id: "",
    location: "",
    district: "",
    block_panchayat: "",
    gram_panchayat: "",
    gram_panchayat_code: "",
  });
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      workshop_name: "Digital Literacy Awareness Program",
    }));
  }, []);

  function reSetAll() {
    setFormData({
      workshop_name: "",
      date: "",
      from_time: "",
      to_time: "",
      vle_id: "",
      location: "",
      district: "",
      gram_panchayat: "",
      block_panchayat: "",
      gram_panchayat_code: "",
    });
  }

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  // const [districts, setDistricts] = useState<District[]>([]);
  // const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: getDistrictByLocation } = useGetDistrictByLocation();
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleLocationChange = async (locationId: string) => {
    setFormData((prev) => ({
      ...prev,
      location: locationId,
      district: "",
      block_panchayat: "",
      gram_panchayat: "",
    }));
    setLocationError("");

    if (!locationId) return;

    try {
      setLocationLoading(true);

      const res = await getDistrictByLocation({
        location_id: Number(locationId), // ✅ IMPORTANT
      });

      if (res?.result === "success" && res.list?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          district: res.list[0].district,
          gram_panchayat: res.list[0].gram_panchayat,
          block_panchayat: res.list[0].block_panchayat,
          gram_panchayat_code: res.list[0].gram_panchayat_code,
        }));
      } else {
        setLocationError("No district found for this location");
      }
    } catch {
      setLocationError("Failed to fetch district details");
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await GetLocation({
        getBy: "all",
        offset: 0,
      });
      if (res?.list) {
        setLocations(res.list);
      }
    } catch {
      Swal.fire("Error", "Failed to fetch locations", "error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
    today.setDate(today.getDate() + 3);
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
  };

  const MAX_DATE = "2026-03-31";

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.workshop_name.trim())
      newErrors.workshop_name = "Workshop name is required";

    if (!formData.date) newErrors.date = "Date is required";

    if (!formData.from_time) newErrors.from_time = "From time is required";

    if (!formData.to_time) newErrors.to_time = "To time is required";

    if (!formData.location) newErrors.location = "location is required";

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
    if (!formData.location) newErrors.location = "location is required";
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
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
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
                Location <span className="text-red-500">*</span>
              </label>
              <div>
                <select
                  name="location"
                  value={formData.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select Location</option>

                  {locations.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.center_name}
                    </option>
                  ))}
                </select>

                {errors.location && (
                  <p className="text-xs text-red-500 mt-1">{errors.location}</p>
                )}
              </div>
            </div>
            {locationLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <Loader className="w-4 h-4 animate-spin" />
                Fetching data...
              </div>
            )}

            {locationError && (
              <p className="text-xs text-red-500 mt-1">{locationError}</p>
            )}

            <div>
              <label className="text-sm font-medium">
                District <span className="text-red-500">*</span>
              </label>

              <input
                name="district"
                value={formData.district}
                readOnly
                className="w-full border rounded-md px-3 py-2 bg-gray-100"
                placeholder="Auto-filled Based On Selecting Location"
              />

              {errors.district && (
                <p className="text-xs text-red-500">{errors.district}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                Block Panchayat <span className="text-red-500">*</span>
              </label>
              <input
                name="block_panchayat"
                value={formData.block_panchayat}
                readOnly
                className="w-full border rounded-md px-3 py-2 bg-gray-100"
                placeholder="Auto-filled Based On Selecting Location"
              />

              {errors.block_panchayat && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.block_panchayat}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                Gram Panchayat <span className="text-red-500">*</span>
              </label>
              <input
                name="gram_panchayat"
                value={formData.gram_panchayat}
                readOnly
                className="w-full border rounded-md px-3 py-2 bg-gray-100"
                placeholder="Auto-filled Based On Selecting Location"
              />

              {errors.gram_panchayat && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.gram_panchayat}
                </p>
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
