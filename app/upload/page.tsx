"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { TYPES } from "@/lib/constants";

type Dept = {
  id: string;
  code: string;
  name: string;
};

type Sem = {
  id: string;
  number: number;
};

type Subj = {
  id: string;
  name: string;
  department_id: string;
  semester_id: string;
};

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [type, setType] =
    useState("");

  const [selectedDeptIds,
    setSelectedDeptIds] =
    useState<string[]>([]);

  const [selectedSemIds,
    setSelectedSemIds] =
    useState<string[]>([]);

  const [selectedSubjectName,
    setSelectedSubjectName] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [departments,
    setDepartments] =
    useState<Dept[]>([]);

  const [semesters,
    setSemesters] =
    useState<Sem[]>([]);

  const [subjects,
    setSubjects] =
    useState<Subj[]>([]);

  const [loading,
    setLoading] =
    useState(false);

  const [message,
    setMessage] =
    useState("");

  useEffect(() => {
    async function load() {

      const [
        deptRes,
        semRes,
        subjRes,
      ] = await Promise.all([

        supabase
          .from("departments")
          .select("*"),

        supabase
          .from("semesters")
          .select("*"),

        supabase
          .from("subjects")
          .select("*"),

      ]);

      setDepartments(
        deptRes.data || []
      );

      setSemesters(
        semRes.data || []
      );

      setSubjects(
        subjRes.data || []
      );
    }

    load();
  }, []);

  const filteredSubjects =
    useMemo(() => {

      return subjects.filter(
        (s) =>
          (
            selectedDeptIds.length === 0 ||
            selectedDeptIds.includes(
              s.department_id
            )
          ) &&
          (
            selectedSemIds.length === 0 ||
            selectedSemIds.includes(
              s.semester_id
            )
          )
      );

    }, [
      subjects,
      selectedDeptIds,
      selectedSemIds,
    ]);

  const onSubmit =
    async () => {

      setMessage("");

      if (
        !title ||
        !type ||
        !selectedSubjectName ||
        !file
      ) {
        setMessage(
          "Fill all fields"
        );
        return;
      }

      setLoading(true);

      try {

        const {
          data:
          userData,
        } =
          await supabase
            .auth
            .getUser();

        const userId =
          userData
            .user
            ?.id;

        if (!userId) {
          setMessage(
            "Login required"
          );
          return;
        }

        const ext =
          file.name
            .split(".")
            .pop();

        const path =
          `${userId}/${Date.now()}.${ext}`;

        const {
          error:
          uploadErr,
        } =
          await supabase
            .storage
            .from(
              "resources"
            )
            .upload(
              path,
              file
            );

        if (
          uploadErr
        ) {
          setMessage(
            uploadErr.message
          );
          return;
        }

        const subject =
          filteredSubjects.find(
            s =>
              s.name ===
              selectedSubjectName
          );

        const {
          error:
          insertErr,
        } =
          await supabase
            .from(
              "resources"
            )
            .insert([
              {
                title,
                description,
                type,
                subject_id:
                  subject?.id,
                file_path:
                  path,
                uploader_id:
                  userId,
              },
            ]);

        if (
          insertErr
        ) {
          setMessage(
            insertErr.message
          );
        } else {

          setMessage(
            "Upload successful"
          );

          setTitle("");
          setDescription("");
          setType("");
          setSelectedSubjectName("");
          setFile(null);

        }

      } finally {
        setLoading(false);
      }
    };

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

        <div className="mt-6 bg-white border rounded p-6">

          <div className="grid gap-4">

            <Input
              placeholder="Title"
              value={title}
              onChange={(e)=>
                setTitle(
                  e.target.value
                )
              }
            />

            <Input
              placeholder="Description"
              value={description}
              onChange={(e)=>
                setDescription(
                  e.target.value
                )
              }
            />

            <Select
              value={
                selectedSubjectName
              }
              onValueChange={
                setSelectedSubjectName
              }
            >

              <SelectTrigger>

                <SelectValue
                  placeholder="Subject"
                />

              </SelectTrigger>

              <SelectContent>

                {
                  filteredSubjects
                    .map(
                      s => (

                        <SelectItem
                          key={
                            s.id
                          }
                          value={
                            s.name
                          }
                        >
                          {
                            s.name
                          }
                        </SelectItem>

                      )
                    )
                }

              </SelectContent>

            </Select>

            <input
              type="file"
              onChange={(e)=>
                setFile(
                  e.target
                    .files?.[0]
                    || null
                )
              }
            />

            <Button
              onClick={
                onSubmit
              }
              disabled={
                loading
              }
            >

              {
                loading
                  ? "Uploading..."
                  : "Submit"
              }

            </Button>

            {
              message &&
              (
                <p>
                  {message}
                </p>
              )
            }

          </div>

        </div>

      </div>

    </div>

  );
}
