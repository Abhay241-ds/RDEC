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
id:string;
code:string;
};

type Sem = {
id:string;
number:number;
};

type Subj = {
id:string;
name:string;
department_id:string;
semester_id:string;
};

export default function UploadPage(){

const [title,setTitle]=
useState("");

const [description,
setDescription]=
useState("");

const [type,
setType]=
useState("");

const [selectedDept,
setSelectedDept]=
useState("");

const [selectedSem,
setSelectedSem]=
useState("");

const [subject,
setSubject]=
useState("");

const [file,
setFile]=
useState<File|null>(
null
);

const [departments,
setDepartments]=
useState<Dept[]>([]);

const [semesters,
setSemesters]=
useState<Sem[]>([]);

const [subjects,
setSubjects]=
useState<Subj[]>([]);

const [loading,
setLoading]=
useState(false);

const [message,
setMessage]=
useState("");

useEffect(()=>{

async function load(){

const [
dept,
sem,
subj
]=
await Promise.all([

supabase
.from(
"departments"
)
.select("*"),

supabase
.from(
"semesters"
)
.select("*"),

supabase
.from(
"subjects"
)
.select("*"),

]);

setDepartments(
dept.data||[]
);

setSemesters(
sem.data||[]
);

setSubjects(
subj.data||[]
);

}

load();

},[]);

const filteredSubjects=
useMemo(()=>{

return subjects.filter(
s=>

(
!selectedDept||

s.department_id===
selectedDept

)

&&

(
!selectedSem||

s.semester_id===
selectedSem

)

);

},[
subjects,
selectedDept,
selectedSem
]);

async function onSubmit(){

setLoading(true);

try{

const {
data:userData
}=
await supabase
.auth
.getUser();

const userId=
userData.user?.id;

if(!userId){

setMessage(
"Login required"
);

return;

}

if(
!title||
!subject||
!type||
!file
){

setMessage(
"Fill all fields"
);

return;

}

const ext=
file.name
.split(".")
.pop();

const path=
`${userId}/${Date.now()}.${ext}`;

const {
error:
uploadErr
}=
await supabase
.storage
.from(
"resources"
)
.upload(
path,
file
);

if(uploadErr){

setMessage(
uploadErr.message
);

return;

}

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
subject,

file_path:
path,

uploader_id:
userId,

}

]);

setMessage(
"Upload successful"
);

}
finally{

setLoading(false);

}

}

return(

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

<div className="mt-6 border rounded bg-white p-6">

<div className="grid gap-5">

<Input
placeholder="Title"
value={title}
onChange={(e)=>
setTitle(
e.target.value
)}
/>

<Input
placeholder="Description"
value={description}
onChange={(e)=>
setDescription(
e.target.value
)}
/>

{/* Department */}

<div>

<p className="font-semibold mb-2">

Department

</p>

<div className="space-y-2">

{
departments.map(
d=>(

<label
key={d.id}
className="flex gap-2 items-center"
>

<input
type="radio"
name="department"
value={d.id}
checked={
selectedDept===
d.id
}
onChange={(e)=>
setSelectedDept(
e.target.value
)}
/>

{d.code}

</label>

))
}

</div>

</div>

{/* Semester */}

<div>

<p className="font-semibold mb-2">

Semester

</p>

<div className="space-y-2">

{
semesters.map(
s=>(

<label
key={s.id}
className="flex gap-2 items-center"
>

<input
type="radio"
name="semester"
value={s.id}
checked={
selectedSem===
s.id
}
onChange={(e)=>
setSelectedSem(
e.target.value
)}
/>

Semester {s.number}

</label>

))
}

</div>

</div>

<Select
value={subject}
onValueChange={
setSubject
}
>

<SelectTrigger>

<SelectValue
placeholder="Subject"
/>

</SelectTrigger>

<SelectContent>

{
filteredSubjects.map(
s=>(

<SelectItem
key={s.id}
value={s.id}
>

{s.name}

</SelectItem>

))
}

</SelectContent>

</Select>

<Select
value={type}
onValueChange={
setType
}
>

<SelectTrigger>

<SelectValue
placeholder="Type"
/>

</SelectTrigger>

<SelectContent>

{
TYPES.map(
t=>(

<SelectItem
key={t.value}
value={t.value}
>

{t.label}

</SelectItem>

))
}

</SelectContent>

</Select>

<input
type="file"
onChange={(e)=>
setFile(
e.target.files?.[0]
||
null
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
?
"Uploading..."
:
"Submit"
}

</Button>

{
message&&

<p>

{message}

</p>
}

</div>

</div>

</div>

</div>

);

}
