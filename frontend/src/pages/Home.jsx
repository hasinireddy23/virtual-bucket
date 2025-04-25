import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { fetchFiles, uploadFile, deleteFile } from "../api/file"; // 👈 new import

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const email = localStorage.getItem("email");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      alert("No token");
    } else {
      loadFiles();
    }
  }, []);

  const loadFiles = async () => {
    try {
      const fetchedFiles = await fetchFiles(token);
      setFiles(fetchedFiles);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadFile(selectedFile, token);
      setSelectedFile(null);
      document.getElementById("file-input").value = "";
      loadFiles();
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const handleDelete = async (fileName) => {
    try {
      await deleteFile(fileName, token);
      loadFiles();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow px-4 pt-20 pb-8 max-w-6xl mx-auto space-y-8">
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-2xl font-semibold text-blue-600">Upload a File</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="w-full sm:w-auto"
            />
            <button
              onClick={handleUpload}
              className="bg-blue-100 text-blue-700 font-semibold py-2 px-5 rounded-xl shadow hover:bg-blue-200 transition-colors duration-200 border border-blue-200"
            >
              Upload
            </button>
          </div>
        </div>

        {/* File Table */}
        <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Your Files</h2>
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3">File Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Uploaded At</th>
                <th className="p-3">Last Updated</th>
                <th className="p-3"></th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {files.length > 0 ? (
                files.map((file, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3">{file.filename}</td>
                    <td className="p-3">{file.type}</td>
                    <td className="p-3">{new Date(file.upload_time).toLocaleString()}</td>
                    <td className="p-3">{new Date(file.last_updated).toLocaleString()}</td>
                    <td className="p-3">
                      <a
                        href={file.cloudfront_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Download
                      </a>
                    </td>
                    <td className="p-3 space-x-3">
                      <button
                        onClick={() => handleDelete(file.filename)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-6">
                    No files uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
