import React from 'react';
import {Dropdown, DropdownButton, Spinner } from "react-bootstrap";
import { withRouter } from "react-router";
import * as Charts from 'react-chartjs-2';
import { CareLogAPI } from '../../API/CareLog';
import './sidebar.css';

const rand = () => Math.round(Math.random() * 20 - 10);

const PatientDetails = (props) => {
    const [patientData, setPatientData] = React.useState(props.location.patientData);
    const [error, setError] = React.useState(null);
    const [sidebar, setSideBar] = React.useState(true);
    const toggleSideBar = () => setSideBar(!sidebar);

    React.useEffect(() => {
        if(!patientData) {
            CareLogAPI.get(`/doctor/patient/${props.match.params.id}`).then(({data}) => {
                setPatientData(data);
                console.log(data);
            }).catch((err) => {
                console.log(err);
                setError(err.response.data.error);
            })
        }
    }, [props.match.params.id, patientData]);

    if(error) return <div>
        <h1>Error</h1>
        <b>{error}</b>
    </div>
    if(!patientData) return <div className='center'>
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    </div>;
    return (
        <div>
        <div class="sidebar">
            <DropdownButton id="dropdown-basic-button" title="Dropdown button">
                <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
            </DropdownButton>
            <a href="#home">1</a>
            <a href="#news">2</a>
            <a href="#contact">3</a>
            <a href="#about">4</a>
        </div>
        <div class='content'>
            <p>patient {patientData.firstname}</p>
            <Charts.Bar
            options={{
                scales: {
                  yAxes: [
                    {
                      ticks: {
                        beginAtZero: true,
                      },
                    },
                  ],
                },
              }}
                data={{
                    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                    datasets: [
                      {
                        label: 'Scale',
                        data: [rand()],
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.2)',
                          'rgba(54, 162, 235, 0.2)',
                          'rgba(255, 206, 86, 0.2)',
                          'rgba(75, 192, 192, 0.2)',
                          'rgba(153, 102, 255, 0.2)',
                          'rgba(255, 159, 64, 0.2)',
                        ],
                        borderColor: [
                          'rgba(205, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 206, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)',
                          'rgba(255, 159, 64, 1)',
                        ],
                        borderWidth: 1,
                      },
                      {
                        label: 'Scale',
                        data: [rand(), rand(), rand(), rand(), rand(), rand()],
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.2)',
                          'rgba(54, 162, 235, 0.2)',
                          'rgba(255, 206, 86, 0.2)',
                          'rgba(75, 192, 192, 0.2)',
                          'rgba(153, 102, 255, 0.2)',
                          'rgba(255, 159, 64, 0.2)',
                        ],
                        borderColor: [
                          'rgba(205, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 206, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)',
                          'rgba(255, 159, 64, 1)',
                        ],
                        borderWidth: 1,
                      }
                    ],
                  }}
            />
        </div>
        </div>
    )
}
const Dashboard = withRouter(PatientDetails);
export default Dashboard;