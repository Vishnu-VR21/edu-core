import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";
import EditBranchModal from "./EditBranchModal";

export default function BranchDetails() {
  const [branches, setBranches] = useState([]);
  const [editableValues, setEditableValues] = useState({});
  const [editingRows, setEditingRows] = useState({});
  const [selectedBranch, setSelectedBranch] = useState(null);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${config.baseurl}list_branches/`, {
        headers: { Authorization: `Token ${token}` },
      });

      const mappedBranches = response.data.map((branch) => ({
        id: branch.id,
        branchName: branch.branch_name,
        email: branch.email,
        phone: branch.contact_number,
        address: branch.address,
        password: branch.password,
        username: branch.username,
        isBlocked: !branch.is_active,
      }));

      setBranches(mappedBranches);

      const initialEditable = {};
      mappedBranches.forEach((b) => {
        initialEditable[b.id] = { ...b };
      });
      setEditableValues(initialEditable);

      const initialEditing = {};
      mappedBranches.forEach((b) => {
        initialEditing[b.id] = false;
      });
      setEditingRows(initialEditing);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch branches");
    }
  };

  useEffect(() => {
    const loadBranches = async () => {
      try {
        await fetchBranches();
      } catch (err) {
        console.error(err);
      }
    };
    loadBranches();
  }, []);

  const handleSave = async (updatedBranch) => {
    try {
      const token = localStorage.getItem("token");

      if (!updatedBranch || !updatedBranch.id) {
        console.error("Invalid branch data:", updatedBranch);
        toast.error("Failed to update branch: missing ID");
        return;
      }

      console.log("payload", updatedBranch);

      await axios.put(
        `${config.baseurl}update_branch/${updatedBranch.id}/`,
        {
          branch_name: updatedBranch.branchName,
          address: updatedBranch.address,
          email: updatedBranch.email,
          contact_number: updatedBranch.phone,
          username: updatedBranch.username,
          password: updatedBranch.password,
        },
        {
          headers: { Authorization: `Token ${token}` },
        },
      );

      toast.success("Branch updated successfully!");
      fetchBranches();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update branch");
    }
  };

  const handleDelete = async (branchId) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${config.baseurl}delete_branch/${branchId}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      toast.success("Branch deleted successfully!");
      fetchBranches();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete branch");
    }
  };

  const handleBlock = async (branchId) => {
    try {
      const token = localStorage.getItem("token");
      const branch = editableValues[branchId];
      const newIsActive = branch.isBlocked;

      await axios.patch(
        `${config.baseurl}block_branch/${branchId}/`,
        { is_active: newIsActive },
        { headers: { Authorization: `Token ${token}` } },
      );

      toast.success(
        `Branch ${branch.isBlocked ? "unblocked" : "blocked"} successfully!`,
      );

      setEditableValues((prev) => ({
        ...prev,
        [branchId]: { ...prev[branchId], isBlocked: !prev[branchId].isBlocked },
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to block/unblock branch");
    }
  };

  return (
    <div className="bg-gray-100 flex justify-center px-6 py-4">
      <div className="w-full max-w-6xl bg-white p-4 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">
          Branch Details
        </h1>

        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] rounded-lg border border-gray-300">
          <table className="w-full min-w-4xl text-[13px]">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-1 text-center font-semibold">Sl No</th>
                <th className="px-2 py-1 text-center font-semibold">Branch Name</th>
                <th className="px-2 py-1 text-center font-semibold">Email</th>
                <th className="px-2 py-1 text-center font-semibold">Phone Number</th>
                <th className="px-2 py-1 text-center font-semibold">Address</th>
                <th className="px-2 py-1 text-center font-semibold">Username</th>
                <th className="px-2 py-1 text-center font-semibold">Password</th>
                <th className="px-2 py-1 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch, index) => (
                <tr
                  key={branch.id}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
                >
                  <td className="px-2 py-1 text-center">{index + 1}</td>
                  <td className="px-2 py-1 text-center">{branch.branchName}</td>
                  <td className="px-2 py-1 text-center">{branch.email}</td>
                  <td className="px-2 py-1 text-center">{branch.phone}</td>
                  <td className="px-2 py-1 text-center">{branch.address}</td>
                  <td className="px-2 py-1 text-center">{branch.username}</td>
                  <td className="px-2 py-1 text-center">{branch.password}</td>
                  <td className="px-2 py-1 text-center flex gap-2 justify-center">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setSelectedBranch(branch)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(branch.id)}
                    >
                      Delete
                    </button>
                    <button
                      className={`hover:underline ${
                        branch.is_active ? "text-yellow-600" : "text-green-600"
                      }`}
                      onClick={() => handleBlock(branch)}
                    >
                      {branch.is_active ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
              {branches.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-4">
                    No branches found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedBranch && (
        <EditBranchModal
          branch={selectedBranch}
          onClose={() => setSelectedBranch(null)}
          onSave={async (updatedBranchData) => {
            await handleSave(updatedBranchData);
            await fetchBranches();
            setSelectedBranch(null);
          }}
        />
      )}
    </div>
  );
}
