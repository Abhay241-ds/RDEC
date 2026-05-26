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
name:string;
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

async function load(){

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

}

load();

},[]);

const filteredSubjects=
useMemo(()=>{

const filtered=
subjects.filter(

s=>

(

selectedDeptIds.length===0

||

selectedDeptIds.includes(
s.department_id
)

)

&&

(

!selectedSem

||

selectedSem===
s.semester_id

)

);

const seen=
new Set();

return filtered.filter(
s=>{

const key=
s.name
.toLowerCase();

if(
seen.has(key)
){

return false;

}

seen.add(key);

return true;

});

},
[
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

try{

setLoading(true);

const {
data:userData
}
=
await supabase
.auth
.getUser();

const uid=
userData.user?.id;

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

const upload=
await supabase
.storage
.from("resources")
.upload(
path,
file
);

if(
upload.error
){

throw upload.error;

}

const subjectName=
subjects.find(
s=>
s.id===
selectedSubject
)?.name;

const rows=
subjects

.filter(
s=>

selectedDeptIds.includes(
s.department_id
)

&&

(
!selectedSem
||

selectedSem===
s.semester_id
)

&&

s.name===
subjectName

)

.map(
s=>({

title,

type,

subject_id:
s.id,

file_path:
path,

status:
"pending",

uploader_id:
uid

})

);

const insert=
await supabase
.from(
"resources"
)
.insert(
rows
);

if(
insert.error
){

throw insert.error;

}

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

setLoading(
false
);

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

<div className="bg-white rounded-3xl shadow-lg p-8 mt-6">

<h1 className="text-4xl font-bold">

Upload Resource

</h1>

<div className="mt-8 space-y-8">

<Input
placeholder="Title"
value={title}
onChange={(e)=>
setTitle(
e.target.value
)}
/>

<div>

<div className="flex justify-between">

<label>

Department

</label>

<button
type="button"

className="
bg-black
text-white
px-4
py-2
rounded
"

onClick={()=>{

if(
selectedDeptIds.length===
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

<div className="flex flex-wrap gap-3 mt-3">

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

prev=>

prev.filter(
x=>
x!==d.id
)

);

}

else{

setSelectedDeptIds(
prev=>[
...prev,
d.id
]
);

}

}}

className={

selectedDeptIds.includes(
d.id
)

?

"bg-blue-700 text-white rounded-xl px-4 py-3"

:

"border rounded-xl px-4 py-3"

}

>

{d.code}

</button>

))

}

</div>

</div>

<div>

<label>

Semester

</label>

<div className="flex gap-3 mt-3">

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

"bg-green-700 text-white rounded-xl px-5 py-3"

:

"border rounded-xl px-5 py-3"

}

>

{s.number}

</button>

))

}

</div>

</div>

<div>

<label>

Subject

</label>

<div className="flex flex-wrap gap-3 mt-3">

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

"bg-purple-700 text-white rounded-xl px-5 py-3"

:

"border rounded-xl px-5 py-3"

}

>

{s.name}

</button>

))

}

</div>

</div>

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

<div>

<label>

Upload File

</label>

<div className="mt-3">

<label
className="
bg-black
text-white
px-5
py-3
rounded
cursor-pointer
"
>

Choose File

<input
hidden
type="file"

onChange={(e)=>
setFile(
e.target.files?.[0]
||
null
)
}
/>

</label>

{
file&&(
<span className="ml-4">
{file.name}
</span>
)
}

</div>

</div>

<Button
className="w-full"
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

"Upload"

}

</Button>

{
message&&(
<p>
{message}
</p>
)
}

</div>

</div>

</div>

);

}
