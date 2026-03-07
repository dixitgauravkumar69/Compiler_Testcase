import { Routes } from '@angular/router';
import { CodeExecution } from './Components/code-execution/code-execution';
import { ProblemWithTestCases } from './Components/problem-with-test-cases/problem-with-test-cases';
import { UserComponent } from './Components/user-component/user-component';
import { LoginComponent } from './Components/login-component/login-component';
import { Student } from './Components/student/student';
import { Teacher } from './Components/teacher/teacher';

export const routes: Routes = [
    {path:"",component:UserComponent},
    {path:"login",component:LoginComponent},
    { path:"Run",component:CodeExecution},
    {path:"Statement",component:ProblemWithTestCases},
    {path:"student",component:Student},
    {path:"teacher",component:Teacher}
];
