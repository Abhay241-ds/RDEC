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

selectedSem===
s.semester_id

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

const uid=
userData.user?.id;

if(
!uid
){

throw new Error(
"Please login"
);

}

const ext=
file.name
.split(".")
.pop();

const filePath=
`${uid}/${Date.now()}.${ext}`;

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
filePath,
file
);

if(
uploadErr
){

throw uploadErr;

}

const {
error:
insertErr
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
filePath,

status:
"pending",

uploader_id:
uid

}

]);

if(
insertErr
){

throw insertErr;

}

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

<div className="min-h-screen bg-slate-100">

<div className="max-w-4xl mx-auto p-8">

<a
href="/"
className="text-blue-700"
>

← Home

</a>

<div className="mt-5 bg-white rounded-3xl p-8 shadow">

<h1 className="text-4xl font-bold">

Upload Resource

</h1>

<p className="text-gray-500 mt-2">

Upload notes and study resources

</p>

<div className="mt-8 space-y-6">

<Input
placeholder="Title"
value={title}
onChange={(e)=>
setTitle(
e.target.value
)}
/>

<div className="flex flex-wrap gap-3">

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
x=>
x!==d.id
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

"bg-blue-700 text-white px-4 py-2 rounded-xl"

:

"border px-4 py-2 rounded-xl"

}

>

{d.code}

</button>

))

}

</div>

<div className="flex gap-3">

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

"bg-green-700 text-white px-4 py-2 rounded-xl"

:

"border px-4 py-2 rounded-xl"

}

>

Sem {s.number}

</button>

))

}

</div>

<div className="flex flex-wrap gap-3">

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

"bg-black text-white px-4 py-2 rounded-xl"

:

"border px-4 py-2 rounded-xl"

}

>

{s.name}

</button>

))

}

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

<label className="block">

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

<div className="border-2 border-dashed rounded-2xl h-40 flex items-center justify-center cursor-pointer">

{

file

?

file.name

:

"Choose File"

}

</div>

</label>

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

"Upload Resource"

}

</Button>

{

message&&

<p className="text-center">

{message}

</p>

}

</div>

</div>

</div>

</div>

);

}
