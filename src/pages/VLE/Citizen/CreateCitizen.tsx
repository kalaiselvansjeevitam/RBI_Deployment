import { useEffect, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import Swal from "sweetalert2";
import {
  useGetCreateCitizenParams,
  useGetDistrictParams,
  useGetWorkshopParams,
} from "../../../app/core/api/Admin";
import { Loader } from "lucide-react";
import type {
  District,
  GetDistrictListRes,
  GetWorkshopRes,
} from "../../../app/lib/types";

const qualifications = ["10th", "12th", "Graduate", "Post Graduate", "Others"];
const genders = ["Male", "Female", "Other"];
// const districts = ["Madurai", "Chennai", "Coimbatore"];
// const states = ["Tamil Nadu", "Kerala", "Karnataka"];
// const pincodes = ["625001", "600001", "641001"];

interface WorkshopOption {
  id: string;
  workshop_name: string;
  date: string;
  from_time: string;
  to_time: string;
  vle_name: string;
  conducted_by: string;
  updated_at: string;
  created_at: string;
  total_citizens: string;
  vle_id: string;
  work_shop_status: string;
}

const CreateCitizen = () => {
  const { mutateAsync: CreateCitizen } = useGetCreateCitizenParams();
  const [workshops, setWorkshops] = useState<WorkshopOption[]>([]);
  const { mutateAsync: Workshop } = useGetWorkshopParams();
  const [districts, setDistricts] = useState<District[]>([]);
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response: GetWorkshopRes = await Workshop();

        const mappedWorkshops = response.list.map((item) => ({
          id: item.id,
          workshop_name: item.workshop_name,
          date: item.date,
          from_time: item.from_time,
          to_time: item.to_time,
          vle_name: item.vle_name,
          conducted_by: item.conducted_by,
          updated_at: item.updated_at,
          created_at: item.created_at,
          total_citizens: item.total_citizens,
          vle_id: item.vle_id,
          work_shop_status: item.work_shop_status,
        }));

        setWorkshops(mappedWorkshops);
        const res: GetDistrictListRes = await getDistricts();
        if (res?.result === "success") {
          setDistricts(res.list);
        }
      } catch (error) {
        console.error("Failed to fetch workshops", error);
      }
    };

    fetchWorkshops();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    mobile_number: "",
    email_id: "",
    qualification: "",
    age: 0,
    gender: "",
    work_shop_id: "",
    father_name: "",
    mother_name: "",
    district: "",
    state: "",
    pincode: "",
  });
  function reSetAll() {
    ((formData.name = ""),
      (formData.father_name = ""),
      (formData.mother_name = ""),
      (formData.mobile_number = ""),
      (formData.work_shop_id = ""),
      (formData.email_id = ""),
      (formData.qualification = ""),
      (formData.age = 0),
      (formData.gender = ""),
      (formData.district = ""),
      (formData.state = ""),
      (formData.pincode = ""));
  }

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "name") {
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData((prev) => ({ ...prev, [name]: lettersOnly }));
      return;
    }
    if (name === "father_name") {
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData((prev) => ({ ...prev, [name]: lettersOnly }));
      return;
    }
    if (name === "mother_name") {
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData((prev) => ({ ...prev, [name]: lettersOnly }));
      return;
    }
    if (name === "pincode") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Required";
    if (!/^\d{10}$/.test(formData.mobile_number))
      newErrors.mobile_number = "Enter valid 10 digit number";
    if (!/^\S+@\S+\.\S+$/.test(formData.email_id))
      newErrors.email_id = "Invalid email";
    if (!formData.age) {
      newErrors.age = "Age is required";
    } else {
      const age = Number(formData.age);

      if (isNaN(age) || age < 18 || age > 60) {
        newErrors.age = "Age must be between 18 and 60";
      }
    }

    if (!formData.work_shop_id) newErrors.work_shop_id = "Required";
    if (!formData.gender) newErrors.gender = "Required";
    if (!formData.father_name.trim()) newErrors.father_name = "Required";
    if (!formData.mother_name.trim()) newErrors.mother_name = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      age: Number(formData.age),
    };

    console.log("Create Citizen Payload:", payload);

    // TODO: API call
    try {
      setLoading(true);
      const result = await CreateCitizen(payload);
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
    <Layout headerTitle="Create Citizen">
      <div className="flex justify-center py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-white p-6 rounded-lg shadow space-y-6"
        >
          <h2 className="text-2xl text-center font-semibold text-gray-700">
            Citizen Details
          </h2>

          <div className="flex flex-col gap-4">
            {/* First Name */}
            <div>
              <label className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Enter Valid Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="text-sm font-medium">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Enter Valid Mobile Number"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    mobile_number: value,
                  }));
                }}
                maxLength={10}
                inputMode="numeric"
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.mobile_number && (
                <p className="text-xs text-red-500">{errors.mobile_number}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Enter Valid Email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.email_id && (
                <p className="text-xs text-red-500">{errors.email_id}</p>
              )}
            </div>

            {/* Qualification */}
            <div>
              <label className="text-sm font-medium">Qualification</label>
              <select
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select</option>
                {qualifications.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              {errors.qualification && (
                <p className="text-xs text-red-500">{errors.qualification}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="text-sm font-medium">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.age && (
                <p className="text-xs text-red-500">{errors.age}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                Select Workshop <span className="text-red-500">*</span>
              </label>
              <select
                name="work_shop_id"
                value={formData.work_shop_id}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select</option>
                {workshops.map((workshop) => (
                  <option key={workshop.id} value={workshop.id}>
                    {workshop.workshop_name} - {workshop.date}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Father Name <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Enter Father Name"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.father_name && (
                <p className="text-xs text-red-500">{errors.father_name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                Mother Name <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Enter Mother Name"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.mother_name && (
                <p className="text-xs text-red-500">{errors.mother_name}</p>
              )}
            </div>
            {/* Gender */}
            <div>
              <label className="text-sm font-medium">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select</option>
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p className="text-xs text-red-500">{errors.gender}</p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="text-sm font-medium">District</label>

              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.district}>
                    {d.district}
                  </option>
                ))}
              </select>

              {errors.district && (
                <p className="text-xs text-red-500">{errors.district}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="text-sm font-medium">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                  setFormData((prev) => ({ ...prev, state: value }));
                }}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter State"
              />
              {errors.state && (
                <p className="text-xs text-red-500">{errors.state}</p>
              )}
            </div>

            {/* Pincode */}
            <div>
              <label className="text-sm font-medium">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setFormData((prev) => ({ ...prev, pincode: value }));
                }}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter 6-digit Pincode"
                inputMode="numeric"
              />
              {errors.pincode && (
                <p className="text-xs text-red-500">{errors.pincode}</p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <Button type="submit" className="bg-purple" disabled={loading}>
              {loading ? (
                <div className=" flex justify-center">
                  <Loader className=" animate-spin" />
                </div>
              ) : (
                "Create Citizen"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateCitizen;
