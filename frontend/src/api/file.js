import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch all uploaded files
export const fetchFiles = async (token) => {
  const res = await axios.get(`${API_URL}/file/files`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.files;
};

// Upload a file
export const uploadFile = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${API_URL}/file/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Delete a file by filename
export const deleteFile = async (filename, token) => {
  const res = await axios.delete(`${API_URL}/file/files/${filename}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
