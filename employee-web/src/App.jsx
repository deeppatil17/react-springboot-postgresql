import { useState } from 'react'
import './App.css'
import {useTable,useGlobalFilter,useSortBy,usePagination} from "react-table";
import * as React from "react";
import axios from "axios";

function App() {

  const [employees,setEmployees]=useState([]);
  const columns=React.useMemo(()=>[
    {Header:"EmployeeId",accessor:"employeeId"},
    {Header:"Name",accessor:"name"},
    {Header:"Manager",accessor:"manager"},
    {Header:"Salary",accessor:"salary"},
    {Header:"Edit", id:"Edit",accessor:"edit",
      Cell:props=>(<button className='editBtn'onClick={()=>handleUpdate(props.cell.row.original)} >Edit</button>)
    },
    {Header:"Delete", id:"Delete",accessor:"delete",
      Cell:props=>(<button className='deleteBtn' onClick={()=>handleDelete(props.cell.row.original)}>Delete</button>)
    }
  ],[]);

  const data=React.useMemo(()=>employees,[]);
  const [employeeData, setEmployeeData]=useState({name:"",manager:"",salary:""});
  const [showCancel,setShowCancel]=useState(false);
  const [errMsg,setErrMsg]=useState("");
  const {getTableProps,getTableBodyProps,headerGroups,page,prepareRow,state,setGlobalFilter,pageCount,nextPage,previousPage,canPreviousPage,canNextPage,gotoPage}=useTable({columns,data:employees,initialState:{pageSize:5}},useGlobalFilter,useSortBy,usePagination);
  const {globalFilter,pageIndex}=state;

  const getAllEmployees=()=>{
    axios.get("http://localhost:8085/employees").then((res)=>{
      console.log(res.data);
      setEmployees(res.data);
    });
  }

  const handleUpdate=(emp)=>{
    setEmployeeData(emp);
    setShowCancel(true);
  }

  const clearAll=()=>{
    setEmployeeData({name:"",manager:"",salary:""});
    getAllEmployees();
  }

  const handleDelete=async(emp)=>{
    const isConfirmed=window.confirm("Are you sure you want to Delete?");
    if(isConfirmed){
         await axios.delete(`http://localhost:8085/employees/${emp.employeeId}`).then((res)=>{
      console.log(res.data);
      setEmployees(res.data);
    });
    }

    window.location.reload();
   
  }

  const handleSubmit=async(e)=>{
    e.preventDefault();
    let erromsg="";
    if(!employeeData.name || !employeeData.manager || !employeeData.salary){
       erromsg="All fields are required!";
       setErrMsg(erromsg);
    }
    if((erromsg.length===0) && employeeData.employeeId){
      await axios.patch(`http://localhost:8085/employees/${employeeData.employeeId}`,employeeData).then((res)=>{
        console.log(res.data);
      });
    }else if(erromsg.length===0){
      await axios.post("http://localhost:8085/employees",employeeData).then((res)=>{
        console.log(res.data);
      });
    }
    clearAll();

  }

  const handleCancel=()=>{
    setEmployeeData({name:"",manager:"",salary:""});
    setShowCancel(false);
  }

  const handleChangle=(e)=>{
    setEmployeeData({...employeeData,[e.target.name]:e.target.value});
    setErrMsg("");
  }

  React.useEffect(()=>{
    getAllEmployees();
  },[]);

  return (
    <>

    <div className='main-container'>
      <h3>Full Stack + React + Spring Boot + PostgreSQL</h3>
      {errMsg && <span className='error'>{errMsg}</span>}
      <div className='add-panel'>
        <div className='addpaneldiv'>
          <label htmlFor="name">Name</label> <br></br>
          <input className='addpanelinput' value={employeeData.name} type="text" onChange={handleChangle} name="name" id="name" />
        </div>
        <div className='addpaneldiv'>
          <label htmlFor="manager">Manager</label> <br></br>
          <input className='addpanelinput' type="text" value={employeeData.manager} onChange={handleChangle} name="manager" id="manager" />
        </div>
        <div className='addpaneldiv'>
          <label htmlFor="salary">Salary</label> <br></br>
          <input className='addpanelinput' type="text" value={employeeData.salary} onChange={handleChangle} name="salary" id="salary" />
        </div>
        <button className='addBtn' onClick={handleSubmit}>{employeeData.employeeId?"Update":"Add"}</button>
        <button className='cancelBtn' disabled={!showCancel} onClick={handleCancel} >Cancel</button>
      </div>
      <input className='searchinput' value={globalFilter || ""} onChange={(e)=>setGlobalFilter(e.target.value)} type="search" name="inputsearch" id="inputsearch"  placeholder='Search Employee Here'/>
      <table className='table' {...getTableProps()}>
      <thead>
        {headerGroups.map((hg)=>(
              <tr {...hg.getHeaderGroupProps()} key={hg.id}>
                 {hg.headers.map((column)=>(
                      <th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}> {column.render("Header")} 
                      {column.isSorted && <span>{column.isSortedDesc?" ⬆️":" ⬇️"}</span>}
                      </th>
                 ))}
              
            </tr>
        ))}
        
      </thead>
      <tbody {...getTableBodyProps()}>
        {page.map((row)=>{
            prepareRow(row);
            return (<tr {...row.getRowProps()} key={row.id}>
                 {row.cells.map((cell)=>(
                      <td {...cell.getCellProps()} key={cell.id}> {cell.render("Cell")} </td>
                 ))}
                      
                    </tr>)
        })}
        
      </tbody>
    </table>
    <div className='pagediv'>
      <button disabled={!canPreviousPage}  className='pageBtn' onClick={()=>gotoPage(0)}>First</button>
      <button disabled={!canPreviousPage}  className='pageBtn'  onClick={previousPage}>Prev</button>
      <span className='idx'>{pageIndex+1} of {pageCount} </span>
      <button disabled={!canNextPage}  className='pageBtn' onClick={nextPage}>Next</button>
      <button disabled={!canNextPage} className='pageBtn' onClick={()=>gotoPage(pageCount-1)}>Last</button>
    </div>
    
    </div>
   
      
    </>
  )
}

export default App
