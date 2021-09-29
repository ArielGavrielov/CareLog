import React from "react";
import {Calendar, momentLocalizer, Views} from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment'
import { CareLogAPI } from "../../API/CareLog";

const localizer = momentLocalizer(moment);
let allViews = Object.keys(Views).map(k => Views[k]);
const DATETIMEFORMAT = 'Y-MM-DD HH:mm';
const TIMEFORMAT = 'HH:mm';
const DATEFORMAT = 'Y-MM-DD';

const Calender = () => {
    const [state, setState] = React.useState({
        selectedDate: null,
        selectedView: Views.DAY,
        events: [],
        min: null,
        max: null,
        isLoading: true
    });

    React.useEffect(() => {
            if(state.isLoading) {
                CareLogAPI.get(`/meetings/worktime/`)
                .then(({data}) => {
                    setState({
                    ...state,
                    min: moment.utc(data.startWorkTime, 'HH:mm').local().toDate(),
                    max: moment.utc(data.endWorkTime, 'HH:mm').local().toDate(),
                    selectedDate: moment()
                    });
                    console.log(data);
                });
            }
    }, [state.isLoading])

    React.useEffect(() => {
        if(state.isLoading && state.selectedDate)
            CareLogAPI.get(`/meetings/month/${state.selectedDate.format(DATEFORMAT)}`).then(({data}) => {
                setState({...state, events: data.map(event => {
                        return {
                            ...event,
                            start: moment.utc(event.start, 'Y-MM-DD HH:mm').local().toDate(),
                            end:  moment.utc(event.end, 'Y-MM-DD HH:mm').local().toDate(),
                        }
                    }),
                    isLoading: false
                });
            })
    }, [state.selectedDate]);

    if(state.isLoading) return <h1>Loading...</h1>;
    return (
        <div>
        <Calendar
            events={state.events}
            formats={{
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: range => `${moment(range.start).format('HH:mm')} – ${moment(range.end).format('HH:mm')}`,
            }}
            defaultView={Views.DAY}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            step={7.5}
            min={state.min}
            max={state.max}
            scrollToTime={new Date()}
            onNavigate={(newDate, view) => {
                console.log(newDate, view);
                setState({...state, selectedDate: moment(newDate), selectedView: view});
            }}
            showMultiDayTimes
            defaultDate={new Date()}
            localizer={localizer}
        />
      </div>
    );
}

export default Calender;