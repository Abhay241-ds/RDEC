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

const [selectedDeptIds,setSelectedDeptIds]=
useState<string[]>([]);

const [selectedSem,setSelectedSem]=
useState("");

const [selectedSubject,setSelectedSubject]=
useState("");

const [file,setFile]=
useState<File|null>(null);

const [departments,setDepartments]=
useState<Dept[]>([]);

const [semesters,setSemesters]=
useState<Sem[]>([]);

const [subjects,setSubjects]=
useState<Subj[]>([]);

const [loading,setLoading]=
useState(false);

const [message,setMessage]=
useState("");

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

);

const unique=
new Map();

filtered.forEach(
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
unique.values());

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

setLoading(
true
);

setMessage("");

try{

const {
data:userData
}
=
await supabase
.auth
.getUser();

const userId=
userData.user?.id;

if(
!userId
){

setMessage(
"Login required"
);

setLoading(
false
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
}
=
await supabase
.storage
.from(
"resources"
)
.upload(
path,
file
);

if(
uploadErr
)
throw uploadErr;

const {
error:
dbErr
}
=
await supabase
.from(
"resources"
)
.insert([

{

title,

type,

subject_id:
selectedSubject,

file_path:
path,

status:
"pending",

uploader_id:
userId,

created_at:
new Date()
.toISOString()

}

]);

if(
dbErr
)
throw dbErr;

setMessage(
"Uploaded successfully. Waiting for admin approval."
);

setTitle("");

setType("");

setSelectedSubject("");

setSelectedSem("");

setSelectedDeptIds([]);

setFile(null);

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

<div className="max-w-4xl mx-auto p-8">

<a
href="/"
className="text-blue-700"
>

← Home

</a>

<h1 className="text-3xl font-bold mt-4">

Upload Resource

</h1>

<div
className="
mt-6
bg-white
border
rounded-lg
p-6
space-y-5
"
>

<Input
placeholder="Title"
value={title}
onChange={(e)=>
setTitle(
e.target.value
)}
/>

<div>

<p className="font-medium mb-2">

Departments

</p>

<div className="flex flex-wrap gap-2">

{

departments.map(
d=>(

<label
key={d.id}
>

<input
type="checkbox"
checked={
selectedDeptIds.includes(
d.id
)
}
onChange={(e)=>{

if(
e.target.checked
){

setSelectedDeptIds([
...selectedDeptIds,
d.id
]);

}

else{

setSelectedDeptIds(

selectedDeptIds.filter(
x=>
x!==d.id
)

);

}

}}
/>

{d.code}

</label>

))

}

</div>

</div>

<Select
value={type}
onValueChange={setType}
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

"Upload"

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
