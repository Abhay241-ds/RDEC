"use client";

import { useState } from "react";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [department, setDepartment] =
    useState("");

  const [semester, setSemester] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  return (
    <div className="bg-slate-50 min-h-screen">

      <div className="max-w-2xl mx-auto p-8">

        <a
          href="/"
          className="text-blue-700"
        >
          ← Home
        </a>

        <h1 className="text-3xl font-bold mt-4">
          Upload Resource
        </h1>

        <div className="mt-6 border rounded-lg bg-white p-6">

          <div className="flex flex-col gap-4">

            {/* Title */}

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              className="border p-2 rounded"
            />

            {/* Department */}

            <select
              value={department}
              onChange={(e) =>
                setDepartment(
                  e.target.value
                )
              }
              className="border p-2 rounded"
            >
              <option>
                Select Department
              </option>

              <option>
                CSE
              </option>

              <option>
                IT
              </option>

              <option>
                ECE
              </option>

            </select>

            {/* Semester */}

            <select
              value={semester}
              onChange={(e) =>
                setSemester(
                  e.target.value
                )
              }
              className="border p-2 rounded"
            >
              <option>
                Select Semester
              </option>

              <option>
                1
              </option>

              <option>
                2
              </option>

              <option>
                3
              </option>

            </select>

            {/* Subject */}

            <select
              value={subject}
              onChange={(e) =>
                setSubject(
                  e.target.value
                )
              }
              className="border p-2 rounded"
            >
              <option>
                Select Subject
              </option>

              <option>
                Java
              </option>

              <option>
                DBMS
              </option>

              <option>
                CN
              </option>

            </select>

            {/* Type */}

            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value
                )
              }
              className="border p-2 rounded"
            >
              <option>
                Select Type
              </option>

              <option>
                Notes
              </option>

              <option>
                Assignment
              </option>

              <option>
                PYQ
              </option>

            </select>

            {/* File */}

            <div>

              <div className="flex items-center gap-4">

                <label className="font-medium">
                  Upload File
                </label>

                <label className="bg-black text-white px-5 py-2 rounded cursor-pointer hover:bg-gray-800">

                  Choose File

                  <input
                    type="file"
                    hidden
                    onChange={(e) =>
                      setFile(
                        e.target.files?.[0] ||
                          null
                      )
                    }
                  />

                </label>

              </div>

              {file && (

                <p className="mt-2 text-sm text-gray-600">

                  Selected:
                  {" "}
                  {file.name}

                </p>

              )}

            </div>

            {/* Upload Button */}

            <button
              className="bg-blue-700 text-white p-3 rounded hover:bg-blue-800"
            >
              Upload
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
