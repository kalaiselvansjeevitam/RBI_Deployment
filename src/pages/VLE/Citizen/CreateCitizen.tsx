import { useEffect, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import Swal from "sweetalert2";
import {
  useGetBlockPanchayat,
  useGetCreateCitizenParams,
  useGetDistrictParams,
  useGetGramPanchayat,
  usegetOccupations,
  useGetWorkshopParams,
} from "../../../app/core/api/Admin";
import { Loader } from "lucide-react";
import type {
  BlockPanchayatRes,
  District,
  GetDistrictListRes,
  GetWorkshopRes,
  GramPanchayatRes,
  occupationRes,
  occupationResponse,
} from "../../../app/lib/types";
const genders = ["Male", "Female", "Others"];
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
  const [occupation, setoccupation] = useState<occupationRes[]>([]);
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: getBlockPanchayat } = useGetBlockPanchayat();
  const { mutateAsync: getOccupations } = usegetOccupations();
  const { mutateAsync: getGramPanchayat } = useGetGramPanchayat();
  const [blockPanchayats, setBlockPanchayats] = useState<BlockPanchayatRes[]>(
    [],
  );
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayatRes[]>([]);
  const [loadingdist, setLoadingdist] = useState(false);
  const [loadingbp, setLoadingbp] = useState(false);

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
        const responseoccupdation: occupationResponse = await getOccupations();
        if (res?.result === "success") {
          setoccupation(responseoccupdation.list);
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
    age: 0,
    gender: "",
    occupation: "",
    work_shop_id: "",
    district: "",
    block_panchayat_name: "",
    gram_panchayat_name: "",
    gram_panchayat_code: "",
  });
  function reSetAll() {
    ((formData.name = ""),
      (formData.mobile_number = ""),
      (formData.work_shop_id = ""),
      (formData.age = 0),
      (formData.gender = ""),
      (formData.occupation = ""),
      (formData.district = ""),
      (formData.block_panchayat_name = ""),
      (formData.gram_panchayat_name = ""),
      (formData.gram_panchayat_code = ""));
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
    if (!formData.district) newErrors.district = "Required";
    if (!formData.block_panchayat_name)
      newErrors.block_panchayat_name = "Required";
    if (!formData.gram_panchayat_name)
      newErrors.gram_panchayat_name = "Required";
    if (!formData.occupation) newErrors.occupation = "Required";

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

  async function handleLocationChange(districtName: string): Promise<void> {
    setLoadingdist(true);
    // set district in form
    setFormData((prev) => ({
      ...prev,
      district: districtName,
      block_panchayat_name: "", // reset dependent field
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
      block_panchayat_name: blockPanchayatName,
      gram_panchayat_name: "", // reset dependent field
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
              {errors.work_shop_id && (
                <p className="text-xs text-red-500">{errors.work_shop_id}</p>
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
            <div>
              <label className="text-sm font-medium">
                Occupation <span className="text-red-500">*</span>
              </label>

              <select
                name="occupation"
                value={formData.occupation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    occupation: e.target.value, // 👈 ID stored
                  }))
                }
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select Occupation</option>

                {occupation.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.occupation} {/* 👈 shown to user */}
                  </option>
                ))}
              </select>
              {errors.occupation && (
                <p className="text-xs text-red-500">{errors.occupation}</p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="text-sm font-medium">
                District <span className="text-red-500">*</span>
              </label>

              <select
                name="district"
                value={formData.district}
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

              {errors.district && (
                <p className="text-xs text-red-500">{errors.district}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                Block Panchayat <span className="text-red-500">*</span>
              </label>

              <select
                name="block_panchayat_name"
                value={formData.block_panchayat_name}
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
              {errors.block_panchayat_name && (
                <p className="text-xs text-red-500">
                  {errors.block_panchayat_name}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                Gram Panchayat <span className="text-red-500">*</span>
              </label>

              <select
                name="gram_panchayat_name"
                value={formData.gram_panchayat_name}
                onChange={(e) => {
                  const selectedGP = gramPanchayats.find(
                    (gp) => gp.gram_panchayat_name === e.target.value,
                  );

                  setFormData((prev) => ({
                    ...prev,
                    gram_panchayat_name: selectedGP?.gram_panchayat_name || "",
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
              {errors.gram_panchayat_name && (
                <p className="text-xs text-red-500">
                  {errors.gram_panchayat_name}
                </p>
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
