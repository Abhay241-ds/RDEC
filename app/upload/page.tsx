"use client";

import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";

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

const [title,setTitle]=
useState("");

const [description,
setDescription]=
useState("");

const [type,setType]=
useState("");

const [selectedDept,
setSelectedDept]=
useState("");

const [selectedSem,
setSelectedSem]=
useState("");

const [selectedSubject,
setSelectedSubject]=
useState("");

const [file,setFile]=
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

const dept=
await supabase
.from(
"departments"
)
.select("*")
.order(
"code"
);

const sem=
await supabase
.from(
"semesters"
)
.select("*")
.order(
"number"
);

const sub=
await supabase
.from(
"subjects"
)
.select("*")
.order(
"name"
);

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

setTimeout(()=>{

setLoading(
false
);

setMessage(
"Ready to upload"
);

},1000);

}

return(

<div className="bg-slate-50 min-h-screen">

<div className="max-w-3xl mx-auto p-8">

<a
href="/"
className="text-blue-700"
>

← Home

</a>

<h1
className="text-3xl font-bold mt-4"
>

Upload Resource

</h1>

<div
className="
bg-white
border
rounded-lg
p-6
mt-6
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

<Input
placeholder="Description"
value={description}
onChange={(e)=>
setDescription(
e.target.value
)}
/>

<div>

<p className="font-medium mb-2">
Department
</p>

<div className="flex flex-wrap gap-2">

{
departments.map(
d=>(

<button
key={d.id}
type="button"
onClick={()=>{
setSelectedDept(
d.id
);

setSelectedSubject(
""
);

}}
className={

selectedDept===d.id

?

"px-4 py-2 rounded bg-blue-700 text-white"

:

"px-4 py-2 rounded border"

}
>

{d.code}

</button>

))
}

</div>

</div>

<div>

<p className="font-medium mb-2">
Semester
</p>

<div className="flex flex-wrap gap-2">

{
semesters.map(
s=>(

<button
key={s.id}
type="button"
onClick={()=>{
setSelectedSem(
s.id
);

setSelectedSubject(
""
);

}}
className={

selectedSem===s.id

?

"px-4 py-2 rounded bg-blue-700 text-white"

:

"px-4 py-2 rounded border"

}
>

{s.number}

</button>

))
}

</div>

</div>

<div>

<p className="font-medium mb-2">
Subject
</p>

<div className="flex flex-wrap gap-2">

{
filteredSubjects.length===0

?

(
<p>

Select Department and Semester

</p>
)

:

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

"px-4 py-2 rounded bg-black text-white"

:

"px-4 py-2 rounded border"

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
e.target
.files?.[0]
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
