import React from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import overlayFactory from 'react-bootstrap-table2-overlay';
import paginationFactory from "react-bootstrap-table2-paginator";
import AddPatient from "./AddPatientModal";
import { CareLogAPI } from "../../API/CareLog";
import { Link } from 'react-router-dom';

const { SearchBar } = Search;

//const linkFollow = 

const columns = [
    {
        dataField: '_id',
        hidden: true
    },
    {
        dataField: 'firstname',
        text: 'First name',
        sort: true
    },
    {
        dataField: 'lastname',
        text: 'Last name',
        sort: true
    },
    {
        dataField: 'email',
        text: 'Email'
    },
    {
        dataField: 'phone',
        text: 'Phone'
    },
    {
        dataField: 'birthdate',
        text: 'Birth date'
    },
    {
        dataField: 'actions',
        text: 'Actions',
        formatter: (cell, row, rowIndex, formatExtraData) => {
            return (
                <Link to={{ 
                    pathname: `/patient/${row._id}`, 
                    patientData: row
                  }}>Read More...</Link>
            );
          }
    }
];

const Patients = () => {
    const [patients, setPatients] = React.useState([]);
    console.log(localStorage.getItem('token'));
    React.useEffect(() => {
        //if(patients.length === 0)
        CareLogAPI.get('/doctor/patients').then((response) => {
            setPatients(response.data);
        });
        console.log(patients);
    }, []);

    return (
        <div>
            <ToolkitProvider
                keyField="_id"
                data={ patients }
                columns={ columns }
                search
            >
                {
                    props => (
                    <div>
                        {console.log(props.searchProps)}
                        <h3>Input something at below input field:</h3>
                        <SearchBar 
                            { ...props.searchProps }
                        />
                        <hr />
                        <BootstrapTable
                            { ...props.baseProps }
                            striped
                            hover
                            condensed
                            overlay={overlayFactory()}
                            pagination={paginationFactory()}
                        />
                    </div>
                    )
                }
            </ToolkitProvider>
            <AddPatient />
        </div>
    );
}

export default Patients;