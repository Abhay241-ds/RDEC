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

type Dept={
id:string;
code:string;
name:string;
};

type Sem={
id:string;
number:number;
};

type Subj={
id:string;
name:string;
department_id:string;
semester_id:string;
};

export default function UploadPage(){

const [title,setTitle]=useState("");
const [type,setType]=useState("");

const [
selectedDeptIds,
setSelectedDeptIds
]=useState<string[]>([]);

const [
selectedSem,
setSelectedSem
]=useState("");

const [
selectedSubject,
setSelectedSubject
]=useState("");

const [
file,
setFile
]=useState<File|null>(null);

const [
departments,
setDepartments
]=useState<Dept[]>([]);

const [
semesters,
setSemesters
]=useState<Sem[]>([]);

const [
subjects,
setSubjects
]=useState<Subj[]>([]);

const [
loading,
setLoading
]=useState(false);

const [
message,
setMessage
]=useState("");

useEffect(()=>{

(async()=>{

const dept=
await supabase
.from("departments")
.select("*")
.order("code");

const sem=
await supabase
.from("semesters")
.select("*")
.order("number");

const sub=
await supabase
.from("subjects")
.select("*")
.order("name");

setDepartments(
dept.data||[]
);

setSemesters(
sem.data||[]
);

setSubjects(
sub.data||[]
);

})();

},[]);

const filteredSubjects=
useMemo(()=>{

const unique=
new Map();

subjects
.filter(
s=>

(
selectedDeptIds.length===0||

selectedDeptIds.includes(
s.department_id
)

)

&&

(
!selectedSem||

s.semester_id===
selectedSem

)

)

.forEach(
s=>{

if(
!unique.has(
s.name
)
){

unique.set(
s.name,
s
);

}

});

return Array.from(
unique.values()
);

},[
subjects,
selectedDeptIds,
selectedSem
]);

async function onSubmit(){

if(
!title||
!type||
!selectedSubject||
!file
){

setMessage(
"Fill all fields"
);

return;

}

setLoading(true);

try{

const {
data:user
}
=
await supabase
.auth
.getUser();

const uid=
user.user?.id;

if(
!uid
){

throw new Error(
"Login required"
);

}

const ext=
file.name
.split(".")
.pop();

const path=
`${uid}/${Date.now()}.${ext}`;

await supabase
.storage
.from("resources")
.upload(
path,
file
);

await supabase
.from("resources")
.insert([{

title,

type,

subject_id:
selectedSubject,

file_path:
path,

status:
"pending",

uploader_id:
uid

}]);

setMessage(
"Uploaded successfully"
);

}
catch(
e:any
){

setMessage(
e.message
);

}

setLoading(false);

}

return(

<div className="bg-slate-50 min-h-screen">

<div className="max-w-5xl mx-auto p-8">

<a
href="/"
className="text-blue-700"
>

← Home

</a>

<div className="mt-5 bg-white rounded-3xl shadow-lg p-8 space-y-8">

<h1 className="text-4xl font-bold">

Upload Resource

</h1>

<div>

<label className="font-semibold">

Title

</label>

<Input
value={title}
onChange={(e)=>
setTitle(
e.target.value
)}
placeholder="Enter title"
/>

</div>

<div>

<div className="flex justify-between">

<label className="font-semibold">

Department

</label>

<button
type="button"
className="bg-black text-white px-4 py-2 rounded"

onClick={()=>{

if(
selectedDeptIds.length
===
departments.length
){

setSelectedDeptIds([]);

}

else{

setSelectedDeptIds(
departments.map(
d=>d.id
)
);

}

}}

>

Select All

</button>

</div>

<div className="mt-3 flex flex-wrap gap-3">

{

departments.map(
d=>(

<button
key={d.id}
type="button"

onClick={()=>{

if(
selectedDeptIds.includes(
d.id
)
){

setSelectedDeptIds(
selectedDeptIds.filter(
x=>x!==d.id
)
);

}

else{

setSelectedDeptIds([
...selectedDeptIds,
d.id
]);

}

}}

className={

selectedDeptIds.includes(
d.id
)

?

"bg-blue-700 text-white px-5 py-3 rounded-xl"

:

"border px-5 py-3 rounded-xl"

}

>

{d.code}

</button>

))

}

</div>

</div>

<div>

<label className="font-semibold">

Semester

</label>

<div className="mt-3 flex gap-3">

{

semesters.map(
s=>(

<button
key={s.id}
type="button"

onClick={()=>
setSelectedSem(
s.id
)
}

className={

selectedSem===s.id

?

"bg-green-700 text-white px-5 py-3 rounded-xl"

:

"border px-5 py-3 rounded-xl"

}

>

{s.number}

</button>

))

}

</div>

</div>

<div>

<label className="font-semibold">

Subject

</label>

<div className="mt-3 flex flex-wrap gap-3">

{

filteredSubjects.map(
s=>(

<button
key={s.id}
type="button"

onClick={()=>
setSelectedSubject(
s.id
)
}

className={

selectedSubject===s.id

?

"bg-purple-700 text-white px-5 py-3 rounded-xl"

:

"border px-5 py-3 rounded-xl"

}

>

{s.name}

</button>

))

}

</div>

</div>

<div>

<label className="font-semibold">

Type

</label>

<Select
value={type}
onValueChange={
setType
}
>

<SelectTrigger>

<SelectValue
placeholder="Select Type"
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

</div>

<div>

<label className="font-semibold">

Upload File

</label>

<input
type="file"
className="mt-3"
/>

</div>

<Button
className="w-full"

disabled={
loading
}

onClick={
onSubmit
}

>

{

loading

?

"Uploading..."

:

"Upload Resource"

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

);

}
