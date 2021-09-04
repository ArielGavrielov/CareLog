import React from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import overlayFactory from 'react-bootstrap-table2-overlay';
import paginationFactory from "react-bootstrap-table2-paginator";
import AddPatient from "./AddPatientModal";
import { CareLogAPI } from "../../API/CareLog";
import { Link } from 'react-router-dom';

const { SearchBar } = Search;

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
                  }}>More details</Link>
            );
          }
    }
];

const pageListRenderer = ({
    pages,
    onPageChange
  }) => {
    // just exclude <, <<, >>, >
    const pageWithoutIndication = pages.filter(p => typeof p.page !== 'string');
    return (
      <div style={{margin: 10}}>
        {
          pageWithoutIndication.map(p => (
            <button key={p.page} className="btn btn-primary" onClick={ () => onPageChange(p.page) }>{ p.page }</button>
          ))
        }
      </div>
    );
  };

const Patients = () => {
    const [state, setState] = React.useState({
        patients: [],
        isFetched: false
    });
    React.useEffect(() => {
        CareLogAPI.get('/doctor/patients').then((response) => {
            setState({patients: response.data, isFetched: true});
        }).catch((err) => {
            console.log(err)
        });
    }, []);

    const Pagingoptions = {
        pageListRenderer
      };

    return (
        <div>
            <ToolkitProvider
                keyField="_id"
                data={ state.patients }
                columns={ columns }
                search
            >
                {
                    props => (
                    <div>
                        <SearchBar 
                            { ...props.searchProps }
                            placeholder='Seach patient'
                            srText='Search patient:'
                        />
                        <BootstrapTable
                            { ...props.baseProps }
                            striped
                            hover
                            condensed
                            loading={!state.isFetched}
                            noDataIndication={() => { return state.isFetched ? 'No data' : 'Loading...'}}
                            overlay={overlayFactory({ spinner: true, background: 'rgba(192,192,192,0.3)', text: <b>Loading...</b>})}
                            pagination={paginationFactory(Pagingoptions)}
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