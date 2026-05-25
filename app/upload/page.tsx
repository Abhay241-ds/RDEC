"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [type, setType] =
    useState("");

  const [
    selectedDeptIds,
    setSelectedDeptIds,
  ] =
    useState<string[]>([]);

  const [
    selectedSemIds,
    setSelectedSemIds,
  ] =
    useState<string[]>([]);

  const [
    selectedSubjectName,
    setSelectedSubjectName,
  ] =
    useState("");

  const [
    file,
    setFile,
  ] =
    useState<File | null>(
      null
    );

  const [
    departments,
    setDepartments,
  ] =
    useState<Dept[]>([]);

  const [
    semesters,
    setSemesters,
  ] =
    useState<Sem[]>([]);

  const [
    subjects,
    setSubjects,
  ] =
    useState<Subj[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {

    (
      async () => {

        const [
          {
            data:
              dpts,
          },

          {
            data:
              sems,
          },

          {
            data:
              subjs,
          },

        ] =
          await Promise.all([

            supabase
              .from(
                "departments"
              )
              .select(
                "id,code,name"
              )
              .order(
                "code"
              ),

            supabase
              .from(
                "semesters"
              )
              .select(
                "id,number"
              )
              .order(
                "number"
              ),

            supabase
              .from(
                "subjects"
              )
              .select(
                "id,name,department_id,semester_id"
              )
              .order(
                "name"
              ),

          ]);

        setDepartments(
          dpts || []
        );

        setSemesters(
          sems || []
        );

        setSubjects(
          subjs || []
        );

      }

    )();

  }, []);

  const filteredSubjects =
    useMemo(
      () => {

        const deptSet =
          new Set(
            selectedDeptIds
          );

        const semSet =
          new Set(
            selectedSemIds
          );

        return subjects.filter(
          (s) =>

            (
              deptSet.size === 0 ||

              deptSet.has(
                s.department_id
              )

            )

            &&

            (
              semSet.size === 0 ||

              semSet.has(
                s.semester_id
              )

            )

        );

      },

      [
        subjects,
        selectedDeptIds,
        selectedSemIds,
      ]

    );
