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

const [title,setTitle]=
useState("");

const [description,
setDescription]=
useState("");

const [type,
setType]=
useState("");

const [
selectedDeptIds,
setSelectedDeptIds
]=
useState<string[]>([]);

const [
selectedSemIds,
setSelectedSemIds
]=
useState<string[]>([]);

const [
selectedSubjectName,
setSelectedSubjectName
]=
useState("");

const [
file,
setFile
]=
useState<File|null>(
null
);

const [
departments,
setDepartments
]=
useState<Dept[]>([]);

const [
semesters,
setSemesters
]=
useState<Sem[]>([]);

const [
subjects,
setSubjects
]=
useState<Subj[]>([]);

const [
loading,
setLoading
]=
useState(false);

const [
message,
setMessage
]=
useState<string|null>(
null
);

useEffect(()=>{

(
async()=>{

const [
{
data:dpts
},

{
data:sems
},

{
data:subjs
}

]=
await Promise.all([

supabase
.from(
"departments"
)
.select("*")
.order(
"code"
),

supabase
.from(
"semesters"
)
.select("*")
.order(
"number"
),

supabase
.from(
"subjects"
)
.select("*")
.order(
"name"
),

]);

setDepartments(
dpts||[]
);

setSemesters(
sems||[]
);

setSubjects(
subjs||[]
);

}

)();

},[]);

const filteredSubjects=
useMemo(()=>{

const dept=
new Set(
selectedDeptIds
);

const sem=
new Set(
selectedSemIds
);

return subjects.filter(
s=>

(
dept.size===0||

dept.has(
s.department_id
)

)

&&

(
sem.size===0||

sem.has(
s.semester_id
)

)

);

},[
subjects,
selectedDeptIds,
selectedSemIds
]);

const deduped=
useMemo(()=>{

const map=
new Map();

for(
const s
of
filteredSubjects
){

if(
!map.has(
s.name
)
){

map.set(
s.name,
s.id
);

}

}

return Array.from(
map.entries()
);

},[
filteredSubjects
]);

async function onSubmit(){

if(
!title||
!type||
!selectedSubjectName||
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

try{

const {
data
}=
await supabase
.auth
.getUser();

const userId=
data.user?.id;

if(
!userId
){

setMessage(
"Login required"
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
upErr
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

if(
upErr
){

setMessage(
upErr.message
);

return;

}

const subject=
filteredSubjects.find(
s=>
s.name===
selectedSubjectName
);

const {
error:
dbErr
}=
await supabase
.from(
"resources"
)
.insert([{

title,

description,

type,

subject_id:
subject?.id,

file_path:
path,

uploader_id:
userId,

status:
"pending",

}]);

if(
dbErr
){

setMessage(
dbErr.message
);

}
else{

setMessage(
"Uploaded successfully"
);

}

}
finally{

setLoading(
false
);

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

<h1
className="text-3xl font-bold mt-4"
>

Upload Resource

</h1>

<div
className="
mt-6
border
rounded-lg
bg-white
p-6
"
>

<div
className="
grid
gap-4
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
deduped.map(
([name])=>(

<SelectItem
key={name}
value={name}
>

{name}

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
message&&(

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
