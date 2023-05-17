import GuestHeader from "./guestHomeHeader"
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import QuestionDisplay from "./questionDisplay";
import MockQuestions from "./mockQuestions";
import Paper from '@mui/material/Paper';
export default function GuestHome(){
    let testQuestions = MockQuestions.getQuestions();

    return (
        <>
        <GuestHeader/>
        <Paper>
        <ToggleButtonGroup
        color="primary"
        exclusive
        aria-label="Platform"
      >
        <ToggleButton value="web">Newest</ToggleButton>
        <ToggleButton value="android">Active</ToggleButton>
        <ToggleButton value="ios">Unanswered</ToggleButton>
      </ToggleButtonGroup>

      <QuestionDisplay questions={testQuestions}/>
      </Paper>
      </>
    )
}