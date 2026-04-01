import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";
import EditStaffModal from "./EditStaffModal";

export default function StaffDetails() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isAdmin = user?.role === "ADMIN";

  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [allBranches, setAllBranches] = useState([]);

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${config.baseurl}list_all_branches/`);
      setAllBranches(res.data);
    } catch (err) {
      toast.error("Failed to load branches");
      console.error(err);
    }
  };

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${config.baseurl}list_staffs/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const staffsData = res.data || [];
      setStaffs(staffsData);
    } catch (err) {
      toast.error("Failed to load staffs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
    if (isAdmin) fetchBranches();
  }, []);

  console.log("staffs list", staffs);

  const filteredStaff = isAdmin
    ? selectedBranch === "ALL"
      ? staffs
      : staffs.filter((s) => s.branch_id === selectedBranch)
    : staffs.filter((s) => s.branch_name === user.branch_name);

  const getBranchIdByName = (name) => {
    const branch = allBranches.find((b) => b.branch_name === name);
    return branch ? branch.id : null;
  };

  const handleSave = async (staff) => {
    try {
      setSavingId(staff.id);
      const token = localStorage.getItem("token");

      const payload = {
        full_name: staff.full_name,
        email: staff.email,
        address: staff.address,
        phone_number: staff.phone_number,
      };

      if (isAdmin) {
        const branchId = getBranchIdByName(staff.branch_name);
        if (!branchId) {
          toast.error("Invalid branch selected");
          return;
        }
        payload.branch = branchId;
      }

      console.log("new update", payload);

      await axios.put(`${config.baseurl}update_staff/${staff.id}/`, payload, {
        headers: { Authorization: `Token ${token}` },
      });

      toast.success("Staff updated");
      return true;
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const firstMessage = Array.isArray(data[firstKey])
          ? data[firstKey][0]
          : data[firstKey];

        toast.error(firstMessage);
      } else {
        toast.error("Update failed");
      }
      return false;
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff permanently?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${config.baseurl}delete_staff/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setStaffs((prev) => prev.filter((s) => s.id !== id));
      toast.success("Staff deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleBlock = async (staff) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${config.baseurl}block_staff/${staff.id}/`,
        {},
        { headers: { Authorization: `Token ${token}` } },
      );

      setStaffs((prev) =>
        prev.map((s) =>
          s.id === staff.id ? { ...s, is_active: !s.is_active } : s,
        ),
      );

      toast.success(staff.is_active ? "Staff blocked" : "Staff unblocked");
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="bg-gray-100 flex justify-center px-6 py-4">
      <div className="w-full max-w-6xl bg-white p-4 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">
          Staff Details
        </h1>

        {isAdmin && (
          <div className="mb-4 flex gap-2 flex-row items-center">
            <label className="font-medium text-blue-900 sm:whitespace-nowrap">
              Branch:
            </label>

            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ALL">All Branches</option>

              {allBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] rounded-lg border border-gray-300">
          <table className="w-full min-w-4xl text-[13px]">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-1 text-center font-semibold">Sl No</th>
                <th className="px-2 py-1 text-center font-semibold">
                  Full Name
                </th>
                <th className="px-2 py-1 text-center font-semibold">Address</th>
                <th className="px-2 py-1 text-center font-semibold">Email</th>
                <th className="px-2 py-1 text-center font-semibold">
                  Phone Number
                </th>
                {isAdmin && (
                  <>
                    <th className="px-2 py-1 text-center font-semibold">
                      Branch Name
                    </th>
                    <th className="px-2 py-1 text-center font-semibold">
                      Action
                    </th>
                  </>
                )}
                <th className="px-2 py-1 text-center font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff, index) => (
                <tr
                  key={staff.id}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
                >
                  <td className="px-2 py-1 text-center">{index + 1}</td>
                  <td className="px-2 py-1 text-center">{staff.full_name}</td>
                  <td className="px-2 py-1 text-center">{staff.address}</td>
                  <td className="px-2 py-1 text-center">{staff.email}</td>
                  <td className="px-2 py-1 text-center">
                    {staff.phone_number}
                  </td>
                  {isAdmin && (
                    <>
                      <td className="px-2 py-1 text-center">
                        {staff.branch_name}
                      </td>
                      <td className="px-2 py-1 text-center flex gap-2 justify-center">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => setSelectedStaff(staff)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete(staff.id)}
                        >
                          Delete
                        </button>
                        <button
                          className={`hover:underline ${
                            staff.is_active
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                          onClick={() => handleBlock(staff)}
                        >
                          {staff.is_active ? "Block" : "Unblock"}
                        </button>
                      </td>
                    </>
                  )}
                  <td className="px-2 py-1 text-center">{staff.role}</td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-4">
                    No staff found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStaff && (
        <EditStaffModal
          staff={selectedStaff}
          allBranches={allBranches}
          onClose={() => setSelectedStaff(null)}
          onSave={async (updatedStaff) => {
            const success = await handleSave(updatedStaff);

            if (success) {
              await fetchStaffs();
              setSelectedStaff(null);
            }
          }}
        />
      )}
    </div>
  );
}
