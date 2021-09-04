import React from 'react';

const PatientDetails = (props) => {
    console.log(props);
    if(!props.location.patientData) return null;
    return (
        <div>
            <p>patient {props.location.patientData.firstname}</p>
        </div>
    )
}

export default PatientDetails;