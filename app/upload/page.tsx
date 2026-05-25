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

const [title,setTitle]=
useState("");

const [description,setDescription]=
useState("");

const [type,setType]=
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
message,
setMessage
]=
useState("");

const [
loading,
setLoading
]=
useState(false);

useEffect(()=>{

async function loadData(){

const {
data:dept
}=
await supabase
.from(
"departments"
)
.select("*")
.order(
"code"
);

const {
data:sem
}=
await supabase
.from(
"semesters"
)
.select("*")
.order(
"number"
);

const {
data:sub
}=
await supabase
.from(
"subjects"
)
.select("*")
.order(
"name"
);

setDepartments(
dept||[]
);

setSemesters(
sem||[]
);

setSubjects(
sub||[]
);

}

loadData();

},[]);

const filteredSubjects=
useMemo(()=>{

return subjects.filter(
s=>

(
selectedDeptIds.length===0||

selectedDeptIds.includes(
s.department_id
)

)

&&

(
selectedSemIds.length===0||

selectedSemIds.includes(
s.semester_id
)

)

);

},[
subjects,
selectedDeptIds,
selectedSemIds
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
bg-white
border
rounded-lg
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

<div>

<p className="font-medium">

Departments

</p>

{
departments.map(
d=>(

<label
key={d.id}
className="
flex
gap-2
"
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

<div>

<p className="font-medium">

Semester

</p>

{
semesters.map(
s=>(

<label
key={s.id}
className="
flex
gap-2
"
>

<input
type="checkbox"
checked={
selectedSemIds.includes(
s.id
)
}
onChange={(e)=>{

if(
e.target.checked
){

setSelectedSemIds([
...selectedSemIds,
s.id
]);

}
else{

setSelectedSemIds(

selectedSemIds.filter(
x=>
x!==s.id
)

);

}

}}
/>

Semester
{s.number}

</label>

))
}

</div>

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
filteredSubjects.map(
s=>(

<SelectItem
key={s.id}
value={s.name}
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

</div>

);

}
