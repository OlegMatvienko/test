import { useState, useEffect, useReducer } from 'react';
import { BehaviorSubject, interval, withLatestFrom, filter, map  } from 'rxjs';
const paused = new BehaviorSubject(true);

const timer = interval(1000).pipe(
    withLatestFrom(paused),
    filter(([_, paused]) => !paused),
    map(([seconds, _]) => seconds)
)
function reducer(state, action) {
    switch (action.type) {
      case 'increment':
        return state + 1;
      case 'reset':
        return 0;
      default:
        throw new Error();
    }
  }
export function Timer() {
    const [time, timeReducer] =  useReducer(reducer, 0);;
    const [isPaused, setIsPaused] = useState();
    const [previousTimestamp, setPreviousTimestamp] = useState(null);

    const seconds = time % 60;
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    useEffect(() => {
        const subscription = timer.subscribe((_ => timeReducer({type: 'increment'})
        ));
        return () => {
            subscription.unsubscribe();
        }
    }, [])

    useEffect(() => {
        const subscription = paused.subscribe(p => setIsPaused(p));
        return () => {
            subscription.unsubscribe();
        }
    }, []);

    const handleStart = () => {
        paused.next(!isPaused);
        if (!isPaused) {
            timeReducer({type: 'reset'});
        }
    };
    const handleWait = (e) => {
        if (previousTimestamp && e.timeStamp - previousTimestamp <= 300) {
            paused.next(!isPaused);
        };
        setPreviousTimestamp(e.timeStamp);
    };
    const handleReset = () => {
        timeReducer({type: 'reset'});
        paused.next(false);
    };

    return <>
        <div>{`${hours < 10 ? '0':'' }${hours}:`}{`${minutes < 10 ? '0':'' }${minutes}:`}{`${seconds < 10 ? '0':'' }${seconds}`}</div>
        <div>
            <button onClick={handleStart}>{isPaused ? 'Start' : 'Stop'}</button>
            <button onClick={handleWait}>Wait</button>
            <button onClick={handleReset}>Reset</button>
        </div>
    </>
}