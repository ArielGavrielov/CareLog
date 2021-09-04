import React from 'react';
import { Spinner } from 'react-bootstrap';
import * as Charts from 'react-chartjs-2';
import { CareLogAPI } from '../../API/CareLog';

const PatientDetails = (props) => {
    const [patientData, setPatientData] = React.useState(props.location.patientData);
    const [error, setError] = React.useState(null);

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
    }, []);

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
            <p>patient {patientData.firstname}</p>
            <Charts.Bar 
                data={{
                    labels: ['1', '2', '3', '4', '5', '6'],
                    datasets: [
                        {
                        label: '# patient example',
                        data: [12, 19, 3, 5, 2, 3],
                        fill: false,
                        backgroundColor: [
                            `rgb(${Math.floor(Math.random() * 255) + 0}, ${Math.floor(Math.random() * 255) + 0}, ${Math.floor(Math.random() * 255) + 0})`,
                            `rgb(${Math.floor(Math.random() * 255) + 0}, ${Math.floor(Math.random() * 255) + 0}, ${Math.floor(Math.random() * 255) + 0})`,
                            `rgb(${Math.floor(Math.random() * 255) + 0}, ${Math.floor(Math.random() * 255) + 0}, ${Math.floor(Math.random() * 255) + 0})`,
                            `rgb(${Math.floor(Math.random() * 255) + 0}, ${Math.floor(Math.random() * 255) + 0}, ${Math.floor(Math.random() * 255) + 0})`,
                            `rgb(${Math.floor(Math.random() * 255) + 0}, ${Math.floor(Math.random() * 255) + 0}, ${Math.floor(Math.random() * 255) + 0})`,
                            `rgb(${Math.floor(Math.random() * 255) + 0}, ${Math.floor(Math.random() * 255) + 0}, ${Math.floor(Math.random() * 255) + 0})`,
                        ],
                        borderColor: 'rgba(255, 99, 132, 0.2)',
                        },
                    ],
                }}
            />
        </div>
    )
}

export default PatientDetails;