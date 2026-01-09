import { useEffect, useState } from "react";
import Layout from "../../app/components/Layout/Layout";
import { Button } from "../../app/components/ui/button";
import {
  useGetDistrictParams,
  useGetUserCreateParams,
} from "../../app/core/api/Admin";
import { Loader } from "lucide-react";
import Swal from "sweetalert2";
import type { District, GetDistrictListRes } from "../../app/lib/types";

const CreateUser = () => {
  const { mutateAsync: userCreate } = useGetUserCreateParams();
  const [formData, setFormData] = useState({
    salutations: "",
    first_name: "",
    last_name: "",
    mobile_number: "",
    email_id: "",
    address: "",
    user_type: "",
    district: "",
    sub_district: "",
    csc_id: "",
  });
  const [districts, setDistricts] = useState<District[]>([]);
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

  function reSetAll() {
    ((formData.first_name = ""),
      (formData.last_name = ""),
      (formData.salutations = ""),
      (formData.mobile_number = ""),
      (formData.email_id = ""),
      (formData.address = ""),
      (formData.user_type = ""));
  }
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.salutations) newErrors.salutation = "Required";
    if (!formData.first_name.trim()) newErrors.firstName = "Required";
    // if (!formData.lastName.trim()) newErrors.lastName = "Required";
    if (!/^\d{10}$/.test(formData.mobile_number))
      newErrors.mobile = "Enter valid 10 digit number";
    if (!/^\S+@\S+\.\S+$/.test(formData.email_id))
      newErrors.email = "Invalid email address";
    if (!formData.address.trim()) newErrors.address = "Required";
    if (!formData.user_type) newErrors.user_type = "Required";
    if (!formData.district.trim()) newErrors.district = "Required";
    if (!formData.sub_district.trim()) newErrors.sub_district = "Required";
    if (!formData.csc_id.trim()) newErrors.csc_id = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    console.log("Create User Payload:", formData);
    try {
      setLoading(true);
      const result = await userCreate(formData);
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
    <Layout headerTitle="Create User">
      <div className="flex justify-center py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-white p-6 rounded-lg shadow space-y-6"
        >
          <h2 className="text-2xl text-center font-semibold text-gray-700">
            Enter User Details
          </h2>

          {/* VERTICAL SCROLLABLE FORM */}
          <div className="flex flex-col gap-4 max-h-[165vh] pr-2">
            {/* Salutation */}
            <div>
              <label className="text-sm font-medium">
                Salutation <span className="text-red-500">*</span>
              </label>
              <select
                name="salutations"
                value={formData.salutations}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
              </select>
              {errors.salutation && (
                <p className="text-xs text-red-500 mt-1">{errors.salutation}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="text-sm font-medium">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter First Name"
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter Last Name"
              />
              {/* {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
              )} */}
            </div>

            {/* Mobile */}
            <div>
              <label className="text-sm font-medium">
                Mobile <span className="text-red-500">*</span>
              </label>
              <input
                name="mobile_number"
                value={formData.mobile_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // remove non-numbers
                  setFormData((prev) => ({ ...prev, mobile_number: value }));
                }}
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full border rounded-md px-3 py-2"
                placeholder="10 digit mobile number"
              />

              {errors.mobile && (
                <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter Valid Email"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* User Type */}
            <div>
              <label className="text-sm font-medium">
                User Type <span className="text-red-500">*</span>
              </label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    user_type: e.target.value,
                  }))
                }
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select</option>
                <option value="vle">VLE</option>
                <option value="sub_admin">Sub Admin</option>
                <option value="rbi">RBI</option>
              </select>
              {errors.user_type && (
                <p className="text-xs text-red-500 mt-1">{errors.user_type}</p>
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

            {/* Sub District */}
            <div>
              <label className="text-sm font-medium">
                Sub District <span className="text-red-500">*</span>
              </label>
              <input
                name="sub_district"
                value={formData.sub_district}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter Sub District"
              />
              {errors.sub_district && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.sub_district}
                </p>
              )}
            </div>

            {/* CSC ID */}
            <div>
              <label className="text-sm font-medium">
                CSC ID <span className="text-red-500">*</span>
              </label>
              <input
                name="csc_id"
                value={formData.csc_id}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter CSC ID"
              />
              {errors.csc_id && (
                <p className="text-xs text-red-500 mt-1">{errors.csc_id}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Sticky action */}
          <div className="flex justify-center pt-2">
            <Button type="submit" className="bg-purple" disabled={loading}>
              {loading ? (
                <div className=" flex justify-center">
                  <Loader className=" animate-spin" />
                </div>
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateUser;
