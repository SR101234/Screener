import "./App.css";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Table from "./Components/Table";
import FundPage from "./Components/FundPage";
import Welcome from "./Components/Welcome";
import FundComparison from "./Components/Fund_Comparison";
import SelectionScreen from "./Components/Fund_Selector_For_Compare";
export default function App() {

  return (
    <>
      <BrowserRouter>
    <Routes>
       <Route path='*' element={<Welcome/>}/>
       <Route path='/' element={<Welcome/>}/>
       <Route path='/MFinfo' element={<FundPage/>}/>
       <Route path='/Screens' element={<Table/>}/>
      <Route path='/FundComparison' element={<SelectionScreen/>}/>
    </Routes>
    
    </BrowserRouter>
    </>);
}



