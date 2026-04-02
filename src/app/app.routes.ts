import { Routes } from '@angular/router';
import { CodeExecution } from './Components/code-execution/code-execution';
import { ProblemWithTestCases } from './Components/problem-with-test-cases/problem-with-test-cases';
import { UserComponent } from './Components/user-component/user-component';
import { LoginComponent } from './Components/login-component/login-component';
import { Student } from './Components/student/student';
import { Teacher } from './Components/teacher/teacher';
import { CampusComponent } from './Components/campus-component/campus-component';
import { FindPlacementInfo } from './Components/find-placement-info/find-placement-info';
import { JobDescription } from './Components/job-description/job-description';
import { Profile } from './Components/profile/profile';
import { GenerateResume } from './Components/generate-resume/generate-resume';
import { AccessDenied } from './Components/access-denied/access-denied';
import { NotFound } from './Components/not-found/not-found';
import { Servererror } from './Components/servererror/servererror';
import { LogOut } from './Components/log-out/log-out';
import { LiveComponent } from './Components/live-component/live-component';
import { GetLiveProblems } from './Components/get-live-problems/get-live-problems';
import { StudentLeaderBoard } from './Components/student/student-leader-board/student-leader-board';
import { EditTestCase } from './Components/teacher/edit-test-case/edit-test-case';


export const routes: Routes = [
    {path:"",component:UserComponent},
    {path:"login",component:LoginComponent},
    { path:"Run",component:CodeExecution},
    {path:"Statement",component:ProblemWithTestCases},
    {path:"student",component:Student},
    {path:"teacher",component:Teacher},
    {path:"campusAdd",component:CampusComponent},
     {path:"findJobInfo",component:FindPlacementInfo},
     {path:"jobDescription/:id",component:JobDescription},
     {path:"profile",component:Profile},
     {path:"generateResume",component:GenerateResume},
     {path:"403",component:AccessDenied},
     {path:"404",component:NotFound},
     {path:"500",component:Servererror},
     
     {path:"logout",component:LogOut},
     {path:"live-streaming",component:LiveComponent},
     {path:"studentLive",component:GetLiveProblems},
     {path:"StudentLeaderBoard",component:StudentLeaderBoard},
    {path:"editTestCases/:id",component:EditTestCase},
    
  
];
